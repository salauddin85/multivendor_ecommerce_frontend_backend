
from django.core.cache import cache
from config.celery import app



@app.task
def delete_category_tree_cache():
    try:
        cache.delete_pattern("category_tree_product_available")
        return "success"
    except Exception as e:
        return str(e)