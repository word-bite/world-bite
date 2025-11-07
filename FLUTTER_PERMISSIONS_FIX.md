# 🔧 Correções para o App Flutter

## 1. Adicionar Permissões de Localização (Android)

Edite o arquivo: `android/app/src/main/AndroidManifest.xml`

Adicione estas linhas **ANTES** da tag `<application>`:

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    
    <!-- ✅ ADICIONE ESTAS PERMISSÕES -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    
    <application
        android:label="world_bite_app"
        ...
```

## 2. Permissões para iOS

Edite o arquivo: `ios/Runner/Info.plist`

Adicione estas linhas **ANTES** da última tag `</dict>`:

```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>Precisamos da sua localização para calcular o frete de entrega</string>
<key>NSLocationAlwaysUsageDescription</key>
<string>Precisamos da sua localização para calcular o frete de entrega</string>
```

## 3. Recompilar o App

Após adicionar as permissões:

```bash
cd /caminho/para/seu/app/flutter

# Limpar build anterior
flutter clean

# Pegar dependências
flutter pub get

# Rodar novamente
flutter run
```

---

## ⚠️ Nota sobre Cálculo de Frete

Se você quiser desabilitar temporariamente o cálculo de frete por geolocalização, pode usar uma taxa fixa no código:

### Opção 1: Taxa Fixa (Mais Simples)

Em `lib/screens/cliente/finalizar_pedido_screen.dart`, substitua a função `_calcularFrete`:

```dart
Future<void> _calcularFrete() async {
  setState(() => calculandoFrete = true);
  
  // Usar taxa fixa para testes
  await Future.delayed(Duration(seconds: 1)); // Simular processamento
  
  setState(() {
    taxaEntrega = 8.90; // Taxa fixa
    calculandoFrete = false;
  });
}
```

### Opção 2: Calcular pela Distância Estimada

```dart
Future<void> _calcularFrete() async {
  setState(() => calculandoFrete = true);
  
  try {
    // Pegar localização do usuário
    Position position = await Geolocator.getCurrentPosition(
      desiredAccuracy: LocationAccuracy.high,
    );
    
    // Coordenadas do restaurante (ajuste conforme necessário)
    double restauranteLat = -23.561684;
    double restauranteLng = -46.656139;
    
    // Calcular distância
    double distanciaKm = Geolocator.distanceBetween(
      position.latitude,
      position.longitude,
      restauranteLat,
      restauranteLng,
    ) / 1000;
    
    // Fórmula: R$ 5 + R$ 2 por km
    double frete = 5.0 + (distanciaKm * 2.0);
    
    setState(() {
      taxaEntrega = frete;
      calculandoFrete = false;
    });
    
  } catch (e) {
    print('Erro ao calcular frete: $e');
    // Em caso de erro, usar taxa fixa
    setState(() {
      taxaEntrega = 8.90;
      calculandoFrete = false;
    });
  }
}
```

---

## 🔄 Comandos Úteis

```bash
# Ver logs em tempo real
flutter logs

# Hot reload (recarregar sem perder estado)
# Pressione 'r' no terminal onde flutter run está rodando

# Hot restart (reiniciar app)
# Pressione 'R' no terminal

# Parar o app
# Pressione 'q' no terminal
```
