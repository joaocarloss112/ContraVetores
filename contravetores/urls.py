from denuncias.views import (
    AdminDenunciaListView,
    DenunciaCreateView,
    DenunciaDetailByProtocoloView,
)
from django.conf import settings
from django.conf.urls.static import (
    static,
)
from django.contrib import admin
from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('auth/login', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/denuncias', DenunciaCreateView.as_view(), name='criar-denuncia'),
    path(
        'api/denuncias/<str:protocolo>',
        DenunciaDetailByProtocoloView.as_view(),
        name='consultar-protocolo',
    ),
    path(
        'api/admin/denuncias',
        AdminDenunciaListView.as_view(),
        name='admin-listar-denuncias',
    ),
]

if settings.DEBUG:
  urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)