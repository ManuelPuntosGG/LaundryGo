from django.urls import path
from .views import (
    CleaningServiceRateListView,
    CleaningAddonListView,
    CleaningOrderListCreateView,
    CleaningOrderDetailView,
    CleaningOrderCancelView,
    CleaningAvailableDatesView,
)

urlpatterns = [
    path('rates/', CleaningServiceRateListView.as_view(), name='cleaning-rates-list'),
    path('addons/', CleaningAddonListView.as_view(), name='cleaning-addons-list'),
    path('orders/', CleaningOrderListCreateView.as_view(), name='cleaning-orders-list-create'),
    path('orders/<int:pk>/', CleaningOrderDetailView.as_view(), name='cleaning-order-detail'),
    path('orders/<int:pk>/cancel/', CleaningOrderCancelView.as_view(), name='cleaning-order-cancel'),
    path('schedule/available-dates/', CleaningAvailableDatesView.as_view(), name='cleaning-available-dates'),
]
