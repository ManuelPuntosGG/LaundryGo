from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from django.views.defaults import page_not_found, server_error


def custom_page_not_found(request, exception=None):
    if request.path.startswith('/api/'):
        return JsonResponse({'detail': 'The requested resource was not found.', 'status_code': 404}, status=404)
    return page_not_found(request, exception)


def custom_server_error(request):
    if request.path.startswith('/api/'):
        return JsonResponse({'detail': 'An unexpected server error occurred. Please try again later.', 'status_code': 500}, status=500)
    return server_error(request)


handler404 = custom_page_not_found
handler500 = custom_server_error

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', include('apps.core.urls')),
    path('api/v1/auth/', include('apps.users.urls')),
    path('api/v1/', include('apps.orders.urls')),
    path('api/v1/cleaning/', include('apps.cleaning.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

