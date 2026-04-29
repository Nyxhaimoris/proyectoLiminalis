const Pagination = ({ page, setPage, totalPages }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="pagination">
      <button
        className="pagination-btn"
        disabled={page <= 1}
        onClick={() => setPage((p) => p - 1)}
      >
        Prev
      </button>

      <div className="pagination-info">
        <span className="pagination-page">{page}</span>
        <span className="pagination-separator">/</span>
        <span>{totalPages}</span>
      </div>

      <button
        className="pagination-btn"
        disabled={page >= totalPages}
        onClick={() => setPage((p) => p + 1)}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;