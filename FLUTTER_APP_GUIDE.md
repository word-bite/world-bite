# 📱 Guia Completo: App Flutter World Bite

## 📋 Índice
1. [Requisitos e Setup](#requisitos-e-setup)
2. [Estrutura do Projeto](#estrutura-do-projeto)
3. [Configuração Inicial](#configuração-inicial)
4. [Backend Integration](#backend-integration)
5. [Telas do Cliente](#telas-do-cliente)
6. [Telas do Restaurante](#telas-do-restaurante)
7. [Telas do Entregador](#telas-do-entregador)
8. [Como Executar](#como-executar)

---

## 🛠️ Requisitos e Setup

### Pré-requisitos
```bash
# 1. Instalar Flutter SDK
# Download: https://flutter.dev/docs/get-started/install

# 2. Verificar instalação
flutter doctor

# 3. Instalar dependências do sistema
# Android Studio (para Android)
# Xcode (para iOS - apenas macOS)
```

### Criar o Projeto
```bash
# Navegar para o diretório
cd /Users/sophiadealbuquerqueeleuterio/Documents/projects/

# Criar projeto Flutter
flutter create world_bite_app

# Entrar no projeto
cd world_bite_app
```

---

## 📂 Estrutura do Projeto

```
world_bite_app/
├── lib/
│   ├── main.dart                    # Entrada do app
│   ├── config/
│   │   └── api_config.dart          # Configuração da API
│   ├── models/
│   │   ├── usuario.dart             # Model de usuário
│   │   ├── pedido.dart              # Model de pedido
│   │   ├── prato.dart               # Model de prato
│   │   └── endereco.dart            # Model de endereço
│   ├── services/
│   │   ├── api_service.dart         # Cliente HTTP
│   │   ├── auth_service.dart        # Autenticação
│   │   ├── pedido_service.dart      # Serviço de pedidos
│   │   └── location_service.dart    # Cálculo de frete
│   ├── screens/
│   │   ├── splash_screen.dart       # Tela inicial
│   │   ├── login_screen.dart        # Login
│   │   ├── tipo_usuario_screen.dart # Escolher tipo de usuário
│   │   │
│   │   ├── cliente/
│   │   │   ├── home_cliente.dart
│   │   │   ├── carrinho_screen.dart
│   │   │   ├── finalizar_pedido_screen.dart
│   │   │   └── meus_pedidos_screen.dart
│   │   │
│   │   ├── restaurante/
│   │   │   ├── home_restaurante.dart
│   │   │   ├── pedidos_recebidos_screen.dart
│   │   │   └── detalhes_pedido_restaurante.dart
│   │   │
│   │   └── entregador/
│   │       ├── home_entregador.dart
│   │       ├── pedidos_disponiveis_screen.dart
│   │       ├── pedido_em_andamento_screen.dart
│   │       └── confirmar_entrega_screen.dart
│   │
│   ├── widgets/
│   │   ├── prato_card.dart
│   │   ├── pedido_card.dart
│   │   └── loading_indicator.dart
│   │
│   └── utils/
│       ├── constants.dart
│       └── helpers.dart
│
├── pubspec.yaml                     # Dependências
└── README.md
```

---

## ⚙️ Configuração Inicial

### 1. pubspec.yaml - Dependências

```yaml
name: world_bite_app
description: App de delivery World Bite
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.0.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  
  # HTTP & API
  http: ^1.1.0
  dio: ^5.4.0
  
  # State Management
  provider: ^6.1.1
  
  # Storage
  shared_preferences: ^2.2.2
  
  # Location & Maps
  geolocator: ^10.1.0
  google_maps_flutter: ^2.5.0
  
  # UI Components
  cupertino_icons: ^1.0.6
  flutter_svg: ^2.0.9
  cached_network_image: ^3.3.0
  
  # Utils
  intl: ^0.18.1
  url_launcher: ^6.2.2

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0

flutter:
  uses-material-design: true
```

### 2. Instalar Dependências
```bash
flutter pub get
```

---

## 🌐 Backend Integration

### lib/config/api_config.dart
```dart
class ApiConfig {
  // 🚀 URL do backend no Vercel
  static const String baseUrl = 'https://seu-projeto.vercel.app';
  
  // Para testes locais, use:
  // static const String baseUrl = 'http://10.0.2.2:3000'; // Android Emulator
  // static const String baseUrl = 'http://localhost:3000'; // iOS Simulator
  
  // Endpoints
  static const String loginUsuario = '/api/usuarios/login';
  static const String cadastroUsuario = '/api/usuarios/cadastro';
  static const String listarPratos = '/api/restaurante/prato';
  static const String criarPedido = '/api/pedidos';
  static const String listarPedidos = '/api/pedidos';
  static const String atualizarStatusPedido = '/api/pedidos/:id/status';
  static const String confirmarEntrega = '/api/pedidos/:id/confirmar-entrega';
  static const String calcularFrete = '/api/pedidos/calcular-frete';
}
```

### lib/services/api_service.dart
```dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../config/api_config.dart';

class ApiService {
  static Future<String?> _getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('auth_token');
  }

  static Future<Map<String, String>> _getHeaders() async {
    final token = await _getToken();
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  // GET Request
  static Future<dynamic> get(String endpoint) async {
    final url = Uri.parse('${ApiConfig.baseUrl}$endpoint');
    final headers = await _getHeaders();
    
    print('📡 GET: $url');
    final response = await http.get(url, headers: headers);
    
    print('📥 Status: ${response.statusCode}');
    
    if (response.statusCode == 200) {
      return json.decode(response.body);
    } else {
      throw Exception('Erro ao buscar dados: ${response.statusCode}');
    }
  }

  // POST Request
  static Future<dynamic> post(String endpoint, Map<String, dynamic> data) async {
    final url = Uri.parse('${ApiConfig.baseUrl}$endpoint');
    final headers = await _getHeaders();
    
    print('📡 POST: $url');
    print('📤 Body: ${json.encode(data)}');
    
    final response = await http.post(
      url,
      headers: headers,
      body: json.encode(data),
    );
    
    print('📥 Status: ${response.statusCode}');
    
    if (response.statusCode == 200 || response.statusCode == 201) {
      return json.decode(response.body);
    } else {
      throw Exception('Erro ao enviar dados: ${response.statusCode}');
    }
  }

  // PUT Request
  static Future<dynamic> put(String endpoint, Map<String, dynamic> data) async {
    final url = Uri.parse('${ApiConfig.baseUrl}$endpoint');
    final headers = await _getHeaders();
    
    print('📡 PUT: $url');
    
    final response = await http.put(
      url,
      headers: headers,
      body: json.encode(data),
    );
    
    if (response.statusCode == 200) {
      return json.decode(response.body);
    } else {
      throw Exception('Erro ao atualizar: ${response.statusCode}');
    }
  }

  // DELETE Request
  static Future<void> delete(String endpoint) async {
    final url = Uri.parse('${ApiConfig.baseUrl}$endpoint');
    final headers = await _getHeaders();
    
    final response = await http.delete(url, headers: headers);
    
    if (response.statusCode != 200) {
      throw Exception('Erro ao deletar: ${response.statusCode}');
    }
  }
}
```

---

## 📦 Models

### lib/models/pedido.dart
```dart
class Pedido {
  final int? id;
  final int clienteId;
  final int restauranteId;
  final String status; // 'pendente', 'preparando', 'pronto', 'em_entrega', 'entregue'
  final double valorTotal;
  final double taxaEntrega;
  final String? codigoRetirada;
  final List<ItemPedido> itens;
  final Endereco? enderecoEntrega;
  final DateTime? dataCriacao;

  Pedido({
    this.id,
    required this.clienteId,
    required this.restauranteId,
    required this.status,
    required this.valorTotal,
    required this.taxaEntrega,
    this.codigoRetirada,
    required this.itens,
    this.enderecoEntrega,
    this.dataCriacao,
  });

  factory Pedido.fromJson(Map<String, dynamic> json) {
    return Pedido(
      id: json['id'],
      clienteId: json['clienteId'],
      restauranteId: json['restauranteId'],
      status: json['status'],
      valorTotal: json['valorTotal'].toDouble(),
      taxaEntrega: json['taxaEntrega'].toDouble(),
      codigoRetirada: json['codigoRetirada'],
      itens: (json['itens'] as List)
          .map((item) => ItemPedido.fromJson(item))
          .toList(),
      enderecoEntrega: json['enderecoEntrega'] != null
          ? Endereco.fromJson(json['enderecoEntrega'])
          : null,
      dataCriacao: json['dataCriacao'] != null
          ? DateTime.parse(json['dataCriacao'])
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'clienteId': clienteId,
      'restauranteId': restauranteId,
      'status': status,
      'valorTotal': valorTotal,
      'taxaEntrega': taxaEntrega,
      'codigoRetirada': codigoRetirada,
      'itens': itens.map((item) => item.toJson()).toList(),
    };
  }
}

class ItemPedido {
  final int pratoId;
  final String nome;
  final int quantidade;
  final double preco;

  ItemPedido({
    required this.pratoId,
    required this.nome,
    required this.quantidade,
    required this.preco,
  });

  factory ItemPedido.fromJson(Map<String, dynamic> json) {
    return ItemPedido(
      pratoId: json['pratoId'],
      nome: json['nome'],
      quantidade: json['quantidade'],
      preco: json['preco'].toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'pratoId': pratoId,
      'nome': nome,
      'quantidade': quantidade,
      'preco': preco,
    };
  }
}

class Endereco {
  final int? id;
  final String logradouro;
  final String numero;
  final String bairro;
  final String cidade;
  final String estado;
  final String cep;
  final String? complemento;
  final double? latitude;
  final double? longitude;

  Endereco({
    this.id,
    required this.logradouro,
    required this.numero,
    required this.bairro,
    required this.cidade,
    required this.estado,
    required this.cep,
    this.complemento,
    this.latitude,
    this.longitude,
  });

  factory Endereco.fromJson(Map<String, dynamic> json) {
    return Endereco(
      id: json['id'],
      logradouro: json['logradouro'],
      numero: json['numero'],
      bairro: json['bairro'],
      cidade: json['cidade'],
      estado: json['estado'],
      cep: json['cep'],
      complemento: json['complemento'],
      latitude: json['latitude']?.toDouble(),
      longitude: json['longitude']?.toDouble(),
    );
  }

  String get enderecoCompleto {
    return '$logradouro, $numero - $bairro, $cidade - $estado, $cep';
  }
}

class Prato {
  final int id;
  final String nome;
  final String descricao;
  final double preco;
  final String? urlImagem;
  final String categoria;

  Prato({
    required this.id,
    required this.nome,
    required this.descricao,
    required this.preco,
    this.urlImagem,
    required this.categoria,
  });

  factory Prato.fromJson(Map<String, dynamic> json) {
    return Prato(
      id: json['id'],
      nome: json['nome'],
      descricao: json['descricao'],
      preco: json['preco'].toDouble(),
      urlImagem: json['urlImagem'],
      categoria: json['categoria'],
    );
  }
}
```

---

## 🛒 Telas do Cliente

### lib/screens/cliente/home_cliente.dart
```dart
import 'package:flutter/material.dart';
import '../../models/pedido.dart';
import '../../services/api_service.dart';
import 'carrinho_screen.dart';

class HomeCliente extends StatefulWidget {
  @override
  _HomeClienteState createState() => _HomeClienteState();
}

class _HomeClienteState extends State<HomeCliente> {
  List<Prato> pratos = [];
  List<ItemPedido> carrinho = [];
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    _carregarPratos();
  }

  Future<void> _carregarPratos() async {
    try {
      final response = await ApiService.get('/api/restaurante/prato');
      setState(() {
        pratos = (response['pratos'] as List)
            .map((p) => Prato.fromJson(p))
            .toList();
        isLoading = false;
      });
    } catch (e) {
      print('Erro ao carregar pratos: $e');
      setState(() => isLoading = false);
    }
  }

  void _adicionarAoCarrinho(Prato prato) {
    setState(() {
      final index = carrinho.indexWhere((item) => item.pratoId == prato.id);
      if (index >= 0) {
        // Incrementar quantidade
        carrinho[index] = ItemPedido(
          pratoId: prato.id,
          nome: prato.nome,
          quantidade: carrinho[index].quantidade + 1,
          preco: prato.preco,
        );
      } else {
        // Adicionar novo item
        carrinho.add(ItemPedido(
          pratoId: prato.id,
          nome: prato.nome,
          quantidade: 1,
          preco: prato.preco,
        ));
      }
    });

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('${prato.nome} adicionado ao carrinho'),
        duration: Duration(seconds: 1),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('World Bite'),
        actions: [
          Stack(
            children: [
              IconButton(
                icon: Icon(Icons.shopping_cart),
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => CarrinhoScreen(carrinho: carrinho),
                    ),
                  );
                },
              ),
              if (carrinho.isNotEmpty)
                Positioned(
                  right: 8,
                  top: 8,
                  child: Container(
                    padding: EdgeInsets.all(2),
                    decoration: BoxDecoration(
                      color: Colors.red,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    constraints: BoxConstraints(
                      minWidth: 16,
                      minHeight: 16,
                    ),
                    child: Text(
                      '${carrinho.length}',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 10,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ),
                ),
            ],
          ),
        ],
      ),
      body: isLoading
          ? Center(child: CircularProgressIndicator())
          : ListView.builder(
              itemCount: pratos.length,
              itemBuilder: (context, index) {
                final prato = pratos[index];
                return Card(
                  margin: EdgeInsets.all(8),
                  child: ListTile(
                    leading: prato.urlImagem != null
                        ? Image.network(
                            prato.urlImagem!,
                            width: 60,
                            height: 60,
                            fit: BoxFit.cover,
                          )
                        : Icon(Icons.restaurant, size: 60),
                    title: Text(prato.nome),
                    subtitle: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(prato.descricao),
                        SizedBox(height: 4),
                        Text(
                          'R\$ ${prato.preco.toStringAsFixed(2)}',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            color: Colors.green,
                          ),
                        ),
                      ],
                    ),
                    trailing: IconButton(
                      icon: Icon(Icons.add_shopping_cart),
                      onPressed: () => _adicionarAoCarrinho(prato),
                    ),
                  ),
                );
              },
            ),
    );
  }
}
```

### lib/screens/cliente/carrinho_screen.dart
```dart
import 'package:flutter/material.dart';
import '../../models/pedido.dart';
import 'finalizar_pedido_screen.dart';

class CarrinhoScreen extends StatelessWidget {
  final List<ItemPedido> carrinho;

  const CarrinhoScreen({required this.carrinho});

  double get subtotal {
    return carrinho.fold(0, (sum, item) => sum + (item.preco * item.quantidade));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Carrinho')),
      body: carrinho.isEmpty
          ? Center(child: Text('Carrinho vazio'))
          : Column(
              children: [
                Expanded(
                  child: ListView.builder(
                    itemCount: carrinho.length,
                    itemBuilder: (context, index) {
                      final item = carrinho[index];
                      return ListTile(
                        title: Text(item.nome),
                        subtitle: Text('Quantidade: ${item.quantidade}'),
                        trailing: Text(
                          'R\$ ${(item.preco * item.quantidade).toStringAsFixed(2)}',
                          style: TextStyle(fontWeight: FontWeight.bold),
                        ),
                      );
                    },
                  ),
                ),
                Container(
                  padding: EdgeInsets.all(16),
                  color: Colors.grey[200],
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('Subtotal:', style: TextStyle(fontSize: 18)),
                          Text(
                            'R\$ ${subtotal.toStringAsFixed(2)}',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                      SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) =>
                                  FinalizarPedidoScreen(carrinho: carrinho),
                            ),
                          );
                        },
                        child: Text('Finalizar Pedido'),
                        style: ElevatedButton.styleFrom(
                          minimumSize: Size(double.infinity, 50),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
    );
  }
}
```

### lib/screens/cliente/finalizar_pedido_screen.dart
```dart
import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import '../../models/pedido.dart';
import '../../services/api_service.dart';

class FinalizarPedidoScreen extends StatefulWidget {
  final List<ItemPedido> carrinho;

  const FinalizarPedidoScreen({required this.carrinho});

  @override
  _FinalizarPedidoScreenState createState() => _FinalizarPedidoScreenState();
}

class _FinalizarPedidoScreenState extends State<FinalizarPedidoScreen> {
  String tipoEntrega = 'entrega'; // 'entrega' ou 'retirada'
  double taxaEntrega = 0.0;
  bool calculandoFrete = false;
  Endereco? enderecoSelecionado;

  @override
  void initState() {
    super.initState();
    if (tipoEntrega == 'entrega') {
      _calcularFrete();
    }
  }

  Future<void> _calcularFrete() async {
    setState(() => calculandoFrete = true);
    
    try {
      // Simular cálculo de frete baseado na distância
      // Em produção, você pegaria o endereço real do usuário
      
      Position position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );
      
      // Calcular distância (exemplo simplificado)
      // Coordenadas do restaurante (exemplo)
      double restauranteLat = -23.561684;
      double restauranteLng = -46.656139;
      
      double distanciaKm = Geolocator.distanceBetween(
        position.latitude,
        position.longitude,
        restauranteLat,
        restauranteLng,
      ) / 1000;
      
      // Fórmula simples: R$ 5 + R$ 2 por km
      double frete = 5.0 + (distanciaKm * 2.0);
      
      setState(() {
        taxaEntrega = frete;
        calculandoFrete = false;
      });
      
    } catch (e) {
      print('Erro ao calcular frete: $e');
      setState(() {
        taxaEntrega = 8.90; // Taxa fixa se falhar
        calculandoFrete = false;
      });
    }
  }

  double get subtotal {
    return widget.carrinho.fold(
      0,
      (sum, item) => sum + (item.preco * item.quantidade),
    );
  }

  double get total {
    return tipoEntrega == 'entrega' ? subtotal + taxaEntrega : subtotal;
  }

  Future<void> _finalizarPedido() async {
    try {
      final pedido = Pedido(
        clienteId: 1, // Pegar do SharedPreferences
        restauranteId: 1, // Pegar do contexto
        status: 'pendente',
        valorTotal: subtotal,
        taxaEntrega: taxaEntrega,
        itens: widget.carrinho,
      );

      final response = await ApiService.post(
        '/api/pedidos',
        pedido.toJson(),
      );

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Pedido realizado com sucesso!')),
      );

      // Voltar para home
      Navigator.of(context).popUntil((route) => route.isFirst);
      
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Erro ao finalizar pedido: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Finalizar Pedido')),
      body: Column(
        children: [
          Expanded(
            child: SingleChildScrollView(
              padding: EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Tipo de Entrega
                  Text(
                    'Tipo de Entrega',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  RadioListTile(
                    title: Text('Entrega'),
                    value: 'entrega',
                    groupValue: tipoEntrega,
                    onChanged: (value) {
                      setState(() {
                        tipoEntrega = value!;
                        _calcularFrete();
                      });
                    },
                  ),
                  RadioListTile(
                    title: Text('Retirada no local'),
                    value: 'retirada',
                    groupValue: tipoEntrega,
                    onChanged: (value) {
                      setState(() {
                        tipoEntrega = value!;
                        taxaEntrega = 0;
                      });
                    },
                  ),
                  
                  Divider(),
                  
                  // Resumo
                  Text(
                    'Resumo do Pedido',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  SizedBox(height: 8),
                  ...widget.carrinho.map((item) => Padding(
                    padding: EdgeInsets.symmetric(vertical: 4),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('${item.quantidade}x ${item.nome}'),
                        Text('R\$ ${(item.preco * item.quantidade).toStringAsFixed(2)}'),
                      ],
                    ),
                  )),
                  
                  Divider(),
                  
                  // Totais
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Subtotal:'),
                      Text('R\$ ${subtotal.toStringAsFixed(2)}'),
                    ],
                  ),
                  if (tipoEntrega == 'entrega')
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('Taxa de Entrega:'),
                        calculandoFrete
                            ? SizedBox(
                                width: 16,
                                height: 16,
                                child: CircularProgressIndicator(strokeWidth: 2),
                              )
                            : Text('R\$ ${taxaEntrega.toStringAsFixed(2)}'),
                      ],
                    ),
                  SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Total:',
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        'R\$ ${total.toStringAsFixed(2)}',
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: Colors.green,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
          
          // Botão Finalizar
          Container(
            padding: EdgeInsets.all(16),
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _finalizarPedido,
              child: Text('Confirmar Pedido'),
              style: ElevatedButton.styleFrom(
                minimumSize: Size(double.infinity, 50),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
```

---

## 🏪 Telas do Restaurante

### lib/screens/restaurante/home_restaurante.dart
```dart
import 'package:flutter/material.dart';
import '../../models/pedido.dart';
import '../../services/api_service.dart';

class HomeRestaurante extends StatefulWidget {
  @override
  _HomeRestauranteState createState() => _HomeRestauranteState();
}

class _HomeRestauranteState extends State<HomeRestaurante> {
  List<Pedido> pedidos = [];
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    _carregarPedidos();
  }

  Future<void> _carregarPedidos() async {
    try {
      final response = await ApiService.get('/api/pedidos');
      setState(() {
        pedidos = (response['pedidos'] as List)
            .map((p) => Pedido.fromJson(p))
            .toList();
        isLoading = false;
      });
    } catch (e) {
      print('Erro ao carregar pedidos: $e');
      setState(() => isLoading = false);
    }
  }

  Future<void> _atualizarStatus(int pedidoId, String novoStatus) async {
    try {
      await ApiService.put(
        '/api/pedidos/$pedidoId/status',
        {'status': novoStatus},
      );
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Status atualizado!')),
      );
      
      _carregarPedidos(); // Recarregar lista
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Erro ao atualizar status')),
      );
    }
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'pendente':
        return Colors.orange;
      case 'preparando':
        return Colors.blue;
      case 'pronto':
        return Colors.green;
      case 'em_entrega':
        return Colors.purple;
      case 'entregue':
        return Colors.grey;
      default:
        return Colors.black;
    }
  }

  String _getStatusText(String status) {
    switch (status) {
      case 'pendente':
        return 'Novo Pedido';
      case 'preparando':
        return 'Preparando';
      case 'pronto':
        return 'Pronto';
      case 'em_entrega':
        return 'Em Entrega';
      case 'entregue':
        return 'Entregue';
      default:
        return status;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Pedidos - Restaurante'),
        actions: [
          IconButton(
            icon: Icon(Icons.refresh),
            onPressed: _carregarPedidos,
          ),
        ],
      ),
      body: isLoading
          ? Center(child: CircularProgressIndicator())
          : pedidos.isEmpty
              ? Center(child: Text('Nenhum pedido recebido'))
              : ListView.builder(
                  itemCount: pedidos.length,
                  itemBuilder: (context, index) {
                    final pedido = pedidos[index];
                    return Card(
                      margin: EdgeInsets.all(8),
                      child: ExpansionTile(
                        leading: CircleAvatar(
                          backgroundColor: _getStatusColor(pedido.status),
                          child: Text('#${pedido.id}'),
                        ),
                        title: Text('Pedido #${pedido.id}'),
                        subtitle: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(_getStatusText(pedido.status)),
                            Text('R\$ ${pedido.valorTotal.toStringAsFixed(2)}'),
                          ],
                        ),
                        children: [
                          Padding(
                            padding: EdgeInsets.all(16),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Itens:',
                                  style: TextStyle(fontWeight: FontWeight.bold),
                                ),
                                ...pedido.itens.map((item) => Padding(
                                  padding: EdgeInsets.symmetric(vertical: 4),
                                  child: Text('${item.quantidade}x ${item.nome}'),
                                )),
                                
                                Divider(),
                                
                                // Botões de ação
                                if (pedido.status == 'pendente')
                                  ElevatedButton(
                                    onPressed: () => _atualizarStatus(
                                      pedido.id!,
                                      'preparando',
                                    ),
                                    child: Text('Iniciar Preparo'),
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: Colors.blue,
                                    ),
                                  ),
                                
                                if (pedido.status == 'preparando')
                                  ElevatedButton(
                                    onPressed: () => _atualizarStatus(
                                      pedido.id!,
                                      'pronto',
                                    ),
                                    child: Text('Marcar como Pronto'),
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: Colors.green,
                                    ),
                                  ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    );
                  },
                ),
    );
  }
}
```

---

## 🚚 Telas do Entregador

### lib/screens/entregador/home_entregador.dart
```dart
import 'package:flutter/material.dart';
import '../../models/pedido.dart';
import '../../services/api_service.dart';
import 'pedido_em_andamento_screen.dart';

class HomeEntregador extends StatefulWidget {
  @override
  _HomeEntregadorState createState() => _HomeEntregadorState();
}

class _HomeEntregadorState extends State<HomeEntregador> {
  List<Pedido> pedidosDisponiveis = [];
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    _carregarPedidosDisponiveis();
  }

  Future<void> _carregarPedidosDisponiveis() async {
    try {
      final response = await ApiService.get('/api/pedidos?status=pronto');
      setState(() {
        pedidosDisponiveis = (response['pedidos'] as List)
            .map((p) => Pedido.fromJson(p))
            .toList();
        isLoading = false;
      });
    } catch (e) {
      print('Erro ao carregar pedidos: $e');
      setState(() => isLoading = false);
    }
  }

  Future<void> _aceitarPedido(Pedido pedido) async {
    try {
      await ApiService.put(
        '/api/pedidos/${pedido.id}/status',
        {'status': 'em_entrega'},
      );
      
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => PedidoEmAndamentoScreen(pedido: pedido),
        ),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Erro ao aceitar pedido')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Entregas Disponíveis'),
        actions: [
          IconButton(
            icon: Icon(Icons.refresh),
            onPressed: _carregarPedidosDisponiveis,
          ),
        ],
      ),
      body: isLoading
          ? Center(child: CircularProgressIndicator())
          : pedidosDisponiveis.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.delivery_dining, size: 100, color: Colors.grey),
                      SizedBox(height: 16),
                      Text('Nenhuma entrega disponível no momento'),
                    ],
                  ),
                )
              : ListView.builder(
                  itemCount: pedidosDisponiveis.length,
                  itemBuilder: (context, index) {
                    final pedido = pedidosDisponiveis[index];
                    return Card(
                      margin: EdgeInsets.all(8),
                      child: ListTile(
                        leading: CircleAvatar(
                          backgroundColor: Colors.green,
                          child: Icon(Icons.restaurant, color: Colors.white),
                        ),
                        title: Text('Pedido #${pedido.id}'),
                        subtitle: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('${pedido.itens.length} itens'),
                            if (pedido.enderecoEntrega != null)
                              Text(
                                pedido.enderecoEntrega!.bairro,
                                style: TextStyle(fontSize: 12),
                              ),
                          ],
                        ),
                        trailing: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              'R\$ ${(pedido.valorTotal + pedido.taxaEntrega).toStringAsFixed(2)}',
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                color: Colors.green,
                              ),
                            ),
                            Text(
                              'Frete: R\$ ${pedido.taxaEntrega.toStringAsFixed(2)}',
                              style: TextStyle(fontSize: 10),
                            ),
                          ],
                        ),
                        onTap: () => _showPedidoDetalhes(pedido),
                      ),
                    );
                  },
                ),
    );
  }

  void _showPedidoDetalhes(Pedido pedido) {
    showModalBottomSheet(
      context: context,
      builder: (context) => Container(
        padding: EdgeInsets.all(16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Pedido #${pedido.id}',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 16),
            Text('Itens:', style: TextStyle(fontWeight: FontWeight.bold)),
            ...pedido.itens.map((item) => Text('${item.quantidade}x ${item.nome}')),
            
            if (pedido.enderecoEntrega != null) ...[
              SizedBox(height: 16),
              Text('Endereço:', style: TextStyle(fontWeight: FontWeight.bold)),
              Text(pedido.enderecoEntrega!.enderecoCompleto),
            ],
            
            SizedBox(height: 16),
            Text(
              'Pagamento: R\$ ${(pedido.valorTotal + pedido.taxaEntrega).toStringAsFixed(2)}',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
            
            SizedBox(height: 16),
            ElevatedButton(
              onPressed: () {
                Navigator.pop(context);
                _aceitarPedido(pedido);
              },
              child: Text('Aceitar Entrega'),
              style: ElevatedButton.styleFrom(
                minimumSize: Size(double.infinity, 50),
                backgroundColor: Colors.green,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
```

### lib/screens/entregador/pedido_em_andamento_screen.dart
```dart
import 'package:flutter/material.dart';
import '../../models/pedido.dart';
import 'confirmar_entrega_screen.dart';

class PedidoEmAndamentoScreen extends StatelessWidget {
  final Pedido pedido;

  const PedidoEmAndamentoScreen({required this.pedido});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Pedido #${pedido.id}'),
      ),
      body: Column(
        children: [
          // Mapa (simplificado)
          Container(
            height: 300,
            color: Colors.grey[300],
            child: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.map, size: 100, color: Colors.grey[600]),
                  SizedBox(height: 8),
                  Text('Mapa de navegação aqui'),
                  Text('(Integrar Google Maps)'),
                ],
              ),
            ),
          ),
          
          Expanded(
            child: Padding(
              padding: EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Destino',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  SizedBox(height: 8),
                  if (pedido.enderecoEntrega != null)
                    Text(pedido.enderecoEntrega!.enderecoCompleto),
                  
                  SizedBox(height: 16),
                  Divider(),
                  
                  Text(
                    'Itens do Pedido',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  SizedBox(height: 8),
                  ...pedido.itens.map((item) => Padding(
                    padding: EdgeInsets.symmetric(vertical: 4),
                    child: Text('${item.quantidade}x ${item.nome}'),
                  )),
                  
                  SizedBox(height: 16),
                  Text(
                    'Valor Total: R\$ ${(pedido.valorTotal + pedido.taxaEntrega).toStringAsFixed(2)}',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                  
                  Spacer(),
                  
                  ElevatedButton(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => ConfirmarEntregaScreen(pedido: pedido),
                        ),
                      );
                    },
                    child: Text('Cheguei no Local'),
                    style: ElevatedButton.styleFrom(
                      minimumSize: Size(double.infinity, 50),
                      backgroundColor: Colors.orange,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
```

### lib/screens/entregador/confirmar_entrega_screen.dart
```dart
import 'package:flutter/material.dart';
import '../../models/pedido.dart';
import '../../services/api_service.dart';

class ConfirmarEntregaScreen extends StatefulWidget {
  final Pedido pedido;

  const ConfirmarEntregaScreen({required this.pedido});

  @override
  _ConfirmarEntregaScreenState createState() => _ConfirmarEntregaScreenState();
}

class _ConfirmarEntregaScreenState extends State<ConfirmarEntregaScreen> {
  final TextEditingController _codigoController = TextEditingController();
  bool _isLoading = false;

  Future<void> _confirmarEntrega() async {
    final codigo = _codigoController.text.trim();
    
    if (codigo.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Digite o código de confirmação')),
      );
      return;
    }

    if (codigo != widget.pedido.codigoRetirada) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Código incorreto!')),
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      await ApiService.put(
        '/api/pedidos/${widget.pedido.id}/status',
        {'status': 'entregue'},
      );

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Entrega confirmada com sucesso!')),
      );

      // Voltar para home do entregador
      Navigator.of(context).popUntil((route) => route.isFirst);
      
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Erro ao confirmar entrega')),
      );
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Confirmar Entrega'),
      ),
      body: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Pedido #${widget.pedido.id}',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 16),
            
            Icon(
              Icons.check_circle_outline,
              size: 100,
              color: Colors.green,
            ),
            
            SizedBox(height: 24),
            
            Text(
              'Digite o código fornecido pelo cliente:',
              style: TextStyle(fontSize: 16),
            ),
            SizedBox(height: 16),
            
            TextField(
              controller: _codigoController,
              decoration: InputDecoration(
                border: OutlineInputBorder(),
                labelText: 'Código de Confirmação',
                hintText: 'Ex: 1234',
              ),
              keyboardType: TextInputType.number,
              maxLength: 6,
            ),
            
            SizedBox(height: 24),
            
            _isLoading
                ? Center(child: CircularProgressIndicator())
                : ElevatedButton(
                    onPressed: _confirmarEntrega,
                    child: Text('Confirmar Entrega'),
                    style: ElevatedButton.styleFrom(
                      minimumSize: Size(double.infinity, 50),
                      backgroundColor: Colors.green,
                    ),
                  ),
            
            SizedBox(height: 16),
            
            Text(
              'Código esperado: ${widget.pedido.codigoRetirada ?? "N/A"}',
              style: TextStyle(fontSize: 12, color: Colors.grey),
            ),
          ],
        ),
      ),
    );
  }
}
```

---

## 🚀 Como Executar

### 1. Configurar Backend URL

Edite `lib/config/api_config.dart`:

```dart
// Para produção (Vercel)
static const String baseUrl = 'https://world-bite.vercel.app';

// Para desenvolvimento local
// static const String baseUrl = 'http://10.0.2.2:3000'; // Android
// static const String baseUrl = 'http://localhost:3000'; // iOS
```

### 2. Instalar Dependências
```bash
flutter pub get
```

### 3. Configurar Permissões

**Android** (`android/app/src/main/AndroidManifest.xml`):
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
```

**iOS** (`ios/Runner/Info.plist`):
```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>Precisamos da sua localização para calcular o frete</string>
```

### 4. Executar o App
```bash
# Android
flutter run

# iOS
flutter run -d ios

# Web
flutter run -d chrome
```

---

## 🎯 Fluxos Implementados

### 👤 Cliente
1. ✅ Ver cardápio
2. ✅ Adicionar itens ao carrinho
3. ✅ Ver carrinho com subtotal
4. ✅ Escolher tipo de entrega
5. ✅ Calcular frete automático por geolocalização
6. ✅ Finalizar pedido
7. ✅ Ver histórico de pedidos

### 🏪 Restaurante
1. ✅ Ver pedidos recebidos em tempo real
2. ✅ Mudar status: Pendente → Preparando
3. ✅ Mudar status: Preparando → Pronto
4. ✅ Ver detalhes de cada pedido

### 🚚 Entregador
1. ✅ Ver pedidos disponíveis (status: pronto)
2. ✅ Ver detalhes do pedido
3. ✅ Aceitar entrega
4. ✅ Ver mapa de navegação (placeholder)
5. ✅ Chegar no local
6. ✅ Confirmar entrega com código do cliente

---

## 📝 Próximos Passos

### Melhorias Sugeridas:

1. **Autenticação Completa**
   - Implementar login com email/SMS
   - Armazenar token JWT
   - Refresh token automático

2. **Google Maps Integration**
   - Mostrar rota no mapa
   - Navegação turn-by-turn
   - Atualização de localização em tempo real

3. **Push Notifications**
   - Notificar cliente quando pedido mudar status
   - Notificar restaurante de novo pedido
   - Notificar entregador de pedidos disponíveis

4. **Pagamentos**
   - Integrar Mercado Pago no app
   - PIX, Cartão, Dinheiro

5. **Chat em Tempo Real**
   - Cliente ↔ Restaurante
   - Cliente ↔ Entregador

6. **Avaliações**
   - Cliente avaliar restaurante
   - Cliente avaliar entregador

---

## 🔧 Comandos Úteis

```bash
# Limpar cache
flutter clean

# Atualizar dependências
flutter pub upgrade

# Gerar APK
flutter build apk --release

# Gerar IPA
flutter build ios --release

# Analisar código
flutter analyze

# Formatar código
flutter format .

# Rodar testes
flutter test
```

---

## 📚 Recursos Adicionais

- [Documentação Flutter](https://docs.flutter.dev/)
- [Flutter Packages](https://pub.dev/)
- [Google Maps Flutter](https://pub.dev/packages/google_maps_flutter)
- [Provider State Management](https://pub.dev/packages/provider)
- [HTTP Package](https://pub.dev/packages/http)

---

## 🎨 Personalização

Para mudar cores e temas, edite `lib/main.dart`:

```dart
MaterialApp(
  theme: ThemeData(
    primarySwatch: Colors.green,
    accentColor: Colors.orange,
  ),
);
```

---

**Desenvolvido com ❤️ para World Bite**
