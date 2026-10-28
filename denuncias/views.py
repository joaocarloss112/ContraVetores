from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status as http_status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Andamento, Denuncia
from .serialyzers import (
    AndamentoCriarSerializer,
    AndamentoSerializer,
    DenunciaSerializer,
)


class DenunciaCreateView(generics.CreateAPIView):
  queryset = Denuncia.objects.all()
  serializer_class = DenunciaSerializer
  permission_classes = [permissions.AllowAny]


class DenunciaDetailByProtocoloView(generics.RetrieveAPIView):
  queryset = Denuncia.objects.prefetch_related('andamentos__autor')
  serializer_class = DenunciaSerializer
  lookup_field = 'protocolo'
  permission_classes = [permissions.AllowAny]


class AdminDenunciaListView(generics.ListAPIView):
  queryset = (
      Denuncia.objects.all()
      .prefetch_related('andamentos__autor')
      .order_by('-criado_em')
  )
  serializer_class = DenunciaSerializer
  permission_classes = [permissions.IsAuthenticated]


class AdminDenunciaDetailView(generics.RetrieveAPIView):
  queryset = Denuncia.objects.prefetch_related('andamentos__autor')
  serializer_class = DenunciaSerializer
  lookup_field = 'protocolo'
  permission_classes = [permissions.IsAuthenticated]


class AdminAndamentoCriarView(APIView):
  permission_classes = [permissions.IsAuthenticated]

  def post(self, request, protocolo):
    denuncia = get_object_or_404(Denuncia, protocolo=protocolo)
    serializer = AndamentoCriarSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    dados = serializer.validated_data

    Andamento.objects.create(
        denuncia=denuncia,
        autor=request.user,
        status=dados['status'],
        observacao=dados['observacao'],
    )
    denuncia.status = dados['status']
    denuncia.save(update_fields=['status'])

    denuncia = Denuncia.objects.prefetch_related('andamentos__autor').get(
        pk=denuncia.pk
    )
    return Response(
        DenunciaSerializer(denuncia, context={'request': request}).data,
        status=http_status.HTTP_201_CREATED,
    )
