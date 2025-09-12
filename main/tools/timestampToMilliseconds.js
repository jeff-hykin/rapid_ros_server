export function timestampToMilliseconds({ sec, nsec }) {
    return (sec * 1000) + nsec / 1000000
}