from flask import request

def paginate_query(query, serialize_fn=None, max_per_page=100, default_per_page=20):
    """
    Standard pagination helper for list endpoints.
    Reads 'page' and 'per_page' from request.args.
    """
    try:
        page = max(1, int(request.args.get("page", 1)))
    except (ValueError, TypeError):
        page = 1

    try:
        per_page = min(max_per_page, max(1, int(request.args.get("per_page", default_per_page))))
    except (ValueError, TypeError):
        per_page = default_per_page

    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    
    if serialize_fn:
        items = [serialize_fn(item) for item in pagination.items]
    else:
        items = [item.to_dict() if hasattr(item, "to_dict") else item for item in pagination.items]

    return {
        "items": items,
        "pagination": {
            "page": pagination.page,
            "per_page": pagination.per_page,
            "total_items": pagination.total,
            "total_pages": pagination.pages,
            "has_next": pagination.has_next,
            "has_prev": pagination.has_prev
        }
    }

