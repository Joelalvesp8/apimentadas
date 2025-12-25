'use client';

import { useState, useRef } from 'react';
import { useCart, useCreateOrder } from '@/hooks/useMarketplace';
import { useProfile, useUpdateProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { CreditCard, Upload, ArrowLeft, CheckCircle, MapPin, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { STORE_NAME, STORE_PIX_KEY } from '@/lib/constants/store';

export default function CheckoutPage() {
  const router = useRouter();
  const { data: cart } = useCart();
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();
  const createOrder = useCreateOrder();
  const [paymentProof, setPaymentProof] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loadingCep, setLoadingCep] = useState(false);

  // Address form state
  const [address, setAddress] = useState({
    deliveryAddress: profile?.deliveryAddress || '',
    deliveryCity: profile?.deliveryCity || '',
    deliveryState: profile?.deliveryState || '',
    deliveryZipCode: profile?.deliveryZipCode || '',
    deliveryComplement: profile?.deliveryComplement || '',
  });

  // Buscar endereço pelo CEP usando ViaCEP API
  const handleCepSearch = async (cep: string) => {
    // Remove caracteres não numéricos
    const cleanCep = cep.replace(/\D/g, '');

    if (cleanCep.length !== 8) return;

    setLoadingCep(true);

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();

      if (data.erro) {
        alert('CEP não encontrado');
        return;
      }

      // Preencher campos automaticamente
      setAddress({
        ...address,
        deliveryZipCode: cep,
        deliveryAddress: data.logradouro || '',
        deliveryCity: data.localidade || '',
        deliveryState: data.uf || '',
      });
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      alert('Erro ao buscar CEP. Por favor, preencha manualmente.');
    } finally {
      setLoadingCep(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione uma imagem válida');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Imagem muito grande. Tamanho máximo: 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPaymentProof(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate address
    if (!address.deliveryAddress || !address.deliveryCity || !address.deliveryState || !address.deliveryZipCode) {
      alert('Por favor, preencha todos os campos de endereço obrigatórios');
      return;
    }

    if (!paymentProof) {
      alert('Por favor, envie o comprovante de pagamento');
      return;
    }

    try {
      // Save address to profile first
      await updateProfile.mutateAsync(address);

      // Then create the order
      const result = await createOrder.mutateAsync({ paymentProof });
      alert(result.message || 'Pedido criado com sucesso!');
      router.push('/orders');
    } catch (error: any) {
      alert(error.message || 'Erro ao criar pedido');
    }
  };

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-4 flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="mb-4">Carrinho vazio</p>
            <Link href="/marketplace">
              <Button>Ir às Compras</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Não há mais agrupamento por vendedor - loja única

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-3 md:p-4">
      <div className="max-w-4xl mx-auto">
        <Link href="/cart">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Carrinho
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Finalizar Compra</CardTitle>
            <CardDescription>
              Faça o pagamento via PIX e envie o comprovante
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Resumo do Pedido - Loja Pimentinhas */}
              <div className="space-y-4">
                <h3 className="font-semibold">Resumo do Pedido:</h3>
                <Card className="bg-purple-50 border-purple-200">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <p className="font-semibold text-purple-900">{STORE_NAME}</p>
                        <div className="flex items-center gap-2 text-sm text-purple-700 mt-1">
                          <CreditCard className="w-4 h-4" />
                          <span>Chave PIX: <span className="font-mono font-semibold text-purple-900">{STORE_PIX_KEY}</span></span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {cart.items.map((item) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span>{item.product.name} (x{item.quantity})</span>
                            <span>R$ {(Number(item.product.price) * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="border-t border-purple-300 pt-2 flex justify-between text-xl font-bold">
                        <span>Total:</span>
                        <span className="text-purple-900">R$ {cart.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Instruções de Pagamento */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-2">📱 Como Pagar:</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>Copie a chave PIX acima</li>
                    <li>Abra o app do seu banco</li>
                    <li>Faça o PIX com o valor total</li>
                    <li>Tire um print do comprovante</li>
                    <li>Preencha seu endereço de entrega</li>
                    <li>Envie o comprovante abaixo</li>
                  </ol>
                </CardContent>
              </Card>

              {/* Endereço de Entrega */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  <h3 className="font-semibold">Endereço de Entrega</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* CEP - Primeiro campo */}
                  <div className="md:col-span-2">
                    <Label htmlFor="zipcode">CEP *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="zipcode"
                        placeholder="00000-000"
                        value={address.deliveryZipCode}
                        onChange={(e) => {
                          let value = e.target.value.replace(/\D/g, '');
                          if (value.length > 5) {
                            value = value.slice(0, 5) + '-' + value.slice(5, 8);
                          }
                          setAddress({ ...address, deliveryZipCode: value });
                        }}
                        onBlur={(e) => handleCepSearch(e.target.value)}
                        maxLength={9}
                        required
                        disabled={loadingCep}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleCepSearch(address.deliveryZipCode)}
                        disabled={loadingCep || address.deliveryZipCode.replace(/\D/g, '').length !== 8}
                      >
                        {loadingCep ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Buscando...
                          </>
                        ) : (
                          'Buscar CEP'
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Digite o CEP e clique em &quot;Buscar CEP&quot; ou pressione Tab para buscar automaticamente
                    </p>
                  </div>

                  {/* Endereço/Rua + Número */}
                  <div className="md:col-span-2">
                    <Label htmlFor="address">Endereço (Rua, Avenida) e Número *</Label>
                    <Input
                      id="address"
                      placeholder="Ex: Rua das Flores, 123"
                      value={address.deliveryAddress}
                      onChange={(e) => setAddress({ ...address, deliveryAddress: e.target.value })}
                      required
                      disabled={loadingCep}
                    />
                  </div>

                  {/* Cidade */}
                  <div>
                    <Label htmlFor="city">Cidade *</Label>
                    <Input
                      id="city"
                      placeholder="Ex: São Paulo"
                      value={address.deliveryCity}
                      onChange={(e) => setAddress({ ...address, deliveryCity: e.target.value })}
                      required
                      disabled={loadingCep}
                    />
                  </div>

                  {/* Estado */}
                  <div>
                    <Label htmlFor="state">Estado (UF) *</Label>
                    <Input
                      id="state"
                      placeholder="Ex: SP"
                      maxLength={2}
                      value={address.deliveryState}
                      onChange={(e) => setAddress({ ...address, deliveryState: e.target.value.toUpperCase() })}
                      required
                      disabled={loadingCep}
                    />
                  </div>

                  {/* Complemento */}
                  <div className="md:col-span-2">
                    <Label htmlFor="complement">Complemento (Apartamento, Bloco, etc.)</Label>
                    <Input
                      id="complement"
                      placeholder="Ex: Apto 101, Bloco B"
                      value={address.deliveryComplement}
                      onChange={(e) => setAddress({ ...address, deliveryComplement: e.target.value })}
                      disabled={loadingCep}
                    />
                  </div>
                </div>
              </div>

              {/* Upload do Comprovante */}
              <div className="space-y-3">
                <Label htmlFor="payment-proof" className="flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Comprovante de Pagamento *
                </Label>

                <input
                  ref={fileInputRef}
                  id="payment-proof"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />

                {paymentProof ? (
                  <div className="space-y-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={paymentProof}
                      alt="Comprovante"
                      className="max-w-full h-auto rounded-lg border"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setPaymentProof(null)}
                      className="w-full"
                    >
                      Trocar Comprovante
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Escolher Imagem
                  </Button>
                )}

                <p className="text-sm text-muted-foreground">
                  O vendedor receberá seu comprovante e confirmará o pagamento
                </p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={!paymentProof || createOrder.isPending || updateProfile.isPending}
                className="w-full"
                size="lg"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {(createOrder.isPending || updateProfile.isPending) ? 'Finalizando...' : 'Finalizar Pedido'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
