
from django.core.cache import cache
from config.celery import app



@app.task
def delete_products_list_cache():
    try:
        cache.delete_pattern("products_list::*")
        cache.delete_pattern("product_detail::*")
        cache.delete("top5_categories_with_products")
        cache.delete("best_selling_products")
        cache.delete("latest_products")
        return "success"
    except Exception as e:
        return str(e)