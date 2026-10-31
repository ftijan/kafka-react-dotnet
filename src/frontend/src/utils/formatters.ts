export const formatDate = (dateString: string) => {
    if (!dateString) return 'INVALID DATE';
    return new Date(dateString).toLocaleDateString(undefined, {
        weekday: 'short', month: 'short', day: 'numeric'
    });
};