from django.core.cache import cache
from rest_framework_simplejwt.tokens import OutstandingToken, BlacklistedToken

def clear_user_permissions_cache():
    
    try:
        cache.delete_pattern("*user_permissions_*")
        print("Deleted all user permission caches using delete_pattern()")
    except NotImplementedError:
        print("delete_pattern not supported for this cache backend")


def revoke_user_tokens(user):
    tokens = OutstandingToken.objects.filter(user=user)
    for token in tokens:
        BlacklistedToken.objects.get_or_create(token=token)
