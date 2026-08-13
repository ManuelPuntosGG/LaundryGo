from django.urls import path
from . import views

urlpatterns = [
    path('services/rates/', views.ServiceRateListView.as_view(), name='service_rates'),
    path('orders/', views.OrderListCreateView.as_view(), name='order_list_create'),
    path('orders/<int:pk>/', views.OrderDetailView.as_view(), name='order_detail'),
    path('recurring/', views.RecurringScheduleListView.as_view(), name='recurring_list'),
    path('recurring/<int:pk>/', views.RecurringScheduleDetailView.as_view(), name='recurring_detail'),
    path('schedule/available-dates/', views.AvailableDatesView.as_view(), name='available_dates'),
]
