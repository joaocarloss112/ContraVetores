from django.shortcuts import render
from rest_framework import generics, permissions
from .models import Denuncia
from .serialyzers import DenunciaSerializer

class DenunciaCreateView(generics.CreateAPIView):
  queryset = Denuncia.objects.all()
  serializer_class = DenunciaSerializer
  permission_classes = [permissions.AllowAny]


class DenunciaDetailByProtocoloView(generics.RetrieveAPIView):
  queryset = Denuncia.objects.all()
  serializer_class = DenunciaSerializer
  lookup_field = 'protocolo'
  permission_classes = [permissions.AllowAny]

class AdminDenunciaListView(generics.ListAPIView):
  queryset = Denuncia.objects.all().order_by('-criado_em')
  serializer_class = DenunciaSerializer
  permission_classes = [permissions.IsAuthenticated]
