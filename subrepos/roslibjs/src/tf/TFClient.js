/**
 * @fileOverview
 * @author David Gossow - dgossow@willowgarage.com
 */

import ActionClient from '../actionlib/ActionClient.js';
import Goal from '../actionlib/Goal.js';

import Service from '../core/Service.js';
import Topic from '../core/Topic.js';

import Transform from '../math/Transform.js';

import Ros from '../core/Ros.js';
import { EventEmitter } from 'https://esm.sh/eventemitter3@5.0.1';;

/**
 * A TF Client that listens to TFs from tf2_web_republisher.
 */
export default class TFClient extends EventEmitter {
  /** @type {Goal|false} */
  currentGoal = false;
  /** @type {Topic|false} */
  currentTopic = false;
  frameInfos = {};
  republisherUpdateRequested = false;
  /** @type {((tf: any) => any) | undefined} */
  _subscribeCB = undefined;
  _isDisposed = false;
  /**
   * @param {Object} options
   * @param {Ros} options.ros - The ROSLIB.Ros connection handle.
   * @param {string} [options.fixedFrame=base_link] - The fixed frame.
   * @param {number} [options.angularThres=2.0] - The angular threshold for the TF republisher.
   * @param {number} [options.transThres=0.01] - The translation threshold for the TF republisher.
   * @param {number} [options.rate=10.0] - The rate for the TF republisher.
   * @param {number} [options.updateDelay=50] - The time (in ms) to wait after a new subscription
   *     to update the TF republisher's list of TFs.
   * @param {number} [options.topicTimeout=2.0] - The timeout parameter for the TF republisher.
   * @param {string} [options.serverName="/tf2_web_republisher"] - The name of the tf2_web_republisher server.
   * @param {string} [options.repubServiceName="/republish_tfs"] - The name of the republish_tfs service (non groovy compatibility mode only).
   */
  constructor(options) {
    super();
    this.ros = options.ros;
    this.fixedFrame = options.fixedFrame || 'base_link';
    this.angularThres = options.angularThres || 2.0;
    this.transThres = options.transThres || 0.01;
    this.rate = options.rate || 10.0;
    this.updateDelay = options.updateDelay || 50;
    var seconds = options.topicTimeout || 2.0;
    var secs = Math.floor(seconds);
    var nsecs = Math.floor((seconds - secs) * 1000000000);
    this.topicTimeout = {
      secs: secs,
      nsecs: nsecs
    };
    this.serverName = options.serverName || '/tf2_web_republisher';
    this.repubServiceName = options.repubServiceName || '/republish_tfs';

    // Create an Action Client
    this.actionClient = new ActionClient({
      ros: options.ros,
      serverName: this.serverName,
      actionName: 'tf2_web_republisher/TFSubscriptionAction',
      omitStatus: true,
      omitResult: true
    });

    // Create a Service Client
    this.serviceClient = new Service({
      ros: options.ros,
      name: this.repubServiceName,
      serviceType: 'tf2_web_republisher/RepublishTFs'
    });
  }
  /**
   * Process the incoming TF message and send them out using the callback
   * functions.
   *
   * @param {Object} tf - The TF message from the server.
   */
  processTFArray(tf) {
    tf.transforms.forEach((transform) => {
      var frameID = transform.child_frame_id;
      if (frameID[0] === '/') {
        frameID = frameID.substring(1);
      }
      var info = this.frameInfos[frameID];
      if (info) {
        info.transform = new Transform({
          translation: transform.transform.translation,
          rotation: transform.transform.rotation
        });
        info.cbs.forEach((cb) => {
          cb(info.transform);
        });
      }
    }, this);
  }
  /**
   * Create and send a new goal (or service request) to the tf2_web_republisher
   * based on the current list of TFs.
   */
  updateGoal() {
    var goalMessage = {
      source_frames: Object.keys(this.frameInfos),
      target_frame: this.fixedFrame,
      angular_thres: this.angularThres,
      trans_thres: this.transThres,
      rate: this.rate
    };

    // if we're running in groovy compatibility mode (the default)
    // then use the action interface to tf2_web_republisher
    if (this.ros.groovyCompatibility) {
      if (this.currentGoal) {
        this.currentGoal.cancel();
      }
      this.currentGoal = new Goal({
        actionClient: this.actionClient,
        goalMessage: goalMessage
      });

      this.currentGoal.on('feedback', this.processTFArray.bind(this));
      this.currentGoal.send();
    } else {
      // otherwise, use the service interface
      // The service interface has the same parameters as the action,
      // plus the timeout
      goalMessage.timeout = this.topicTimeout;
      this.serviceClient.callService(goalMessage, this.processResponse.bind(this));
    }

    this.republisherUpdateRequested = false;
  }
  /**
   * Process the service response and subscribe to the tf republisher
   * topic.
   *
   * @param {Object} response - The service response containing the topic name.
   */
  processResponse(response) {
    // Do not setup a topic subscription if already disposed. Prevents a race condition where
    // The dispose() function is called before the service call receives a response.
    if (this._isDisposed) {
      return;
    }

    // if we subscribed to a topic before, unsubscribe so
    // the republisher stops publishing it
    if (this.currentTopic) {
      this.currentTopic.unsubscribe(this._subscribeCB);
    }

    this.currentTopic = new Topic({
      ros: this.ros,
      name: response.topic_name,
      messageType: 'tf2_web_republisher/TFArray'
    });
    this._subscribeCB = this.processTFArray.bind(this);
    this.currentTopic.subscribe(this._subscribeCB);
  }
  /**
   * @callback subscribeCallback
   * @param {Transform} callback.transform - The transform data.
   */
  /**
   * Subscribe to the given TF frame.
   *
   * @param {string} frameID - The TF frame to subscribe to.
   * @param {subscribeCallback} callback - Function with the following params:
   */
  subscribe(frameID, callback) {
    // remove leading slash, if it's there
    if (frameID[0] === '/') {
      frameID = frameID.substring(1);
    }
    // if there is no callback registered for the given frame, create empty callback list
    if (!this.frameInfos[frameID]) {
      this.frameInfos[frameID] = {
        cbs: []
      };
      if (!this.republisherUpdateRequested) {
        setTimeout(this.updateGoal.bind(this), this.updateDelay);
        this.republisherUpdateRequested = true;
      }
    }

    // if we already have a transform, callback immediately
    else if (this.frameInfos[frameID].transform) {
      callback(this.frameInfos[frameID].transform);
    }
    this.frameInfos[frameID].cbs.push(callback);
  }
  /**
   * Unsubscribe from the given TF frame.
   *
   * @param {string} frameID - The TF frame to unsubscribe from.
   * @param {function} callback - The callback function to remove.
   */
  unsubscribe(frameID, callback) {
    // remove leading slash, if it's there
    if (frameID[0] === '/') {
      frameID = frameID.substring(1);
    }
    var info = this.frameInfos[frameID];
    for (var cbs = (info && info.cbs) || [], idx = cbs.length; idx--; ) {
      if (cbs[idx] === callback) {
        cbs.splice(idx, 1);
      }
    }
    if (!callback || cbs.length === 0) {
      delete this.frameInfos[frameID];
    }
  }
  /**
   * Unsubscribe and unadvertise all topics associated with this TFClient.
   */
  dispose() {
    this._isDisposed = true;
    this.actionClient.dispose();
    if (this.currentTopic) {
      this.currentTopic.unsubscribe(this._subscribeCB);
    }
  }
}
