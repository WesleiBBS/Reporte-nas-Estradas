# 🏛️ Servidor Backend para Reporte de Estradas

## 📋 Resumo
Este documento explica onde as fotos e dados estão sendo enviados e como configurar um servidor para receber os reportes.

## 🔄 Status Atual
**As fotos NÃO estão sendo enviadas para lugar nenhum ainda!**

O aplicativo está configurado para:
- ✅ Capturar fotos e dados
- ✅ Preparar dados para envio
- ❌ **SIMULAR** o envio (não envia de verdade)

## 🎯 Para Onde Devem Ser Enviados

### 1. **Configuração Necessária**
No arquivo `config.js`, altere:
```javascript
BASE_URL: 'https://prefeitura-seumunicipio.gov.br/api'
```

### 2. **Endpoints Necessários**
O servidor da prefeitura deve ter:
- `POST /api/reportes` - Receber novos reportes
- `GET /api/reportes/{id}` - Consultar status
- `POST /api/upload` - Upload de fotos

### 3. **Dados Enviados**
Cada reporte contém:
```
- type: Tipo do problema
- description: Descrição detalhada
- urgency: Nível de urgência (baixa/média/alta)
- latitude/longitude: Coordenadas GPS
- photo_0, photo_1, etc: Arquivos de imagem
- timestamp: Data/hora do reporte
```

## 🛠️ Implementação do Servidor

### Opção 1: Servidor Node.js Simples
```javascript
const express = require('express')
const multer = require('multer')
const path = require('path')

const app = express()
const upload = multer({ dest: 'uploads/' })

app.post('/api/reportes', upload.array('photos', 5), (req, res) => {
  const { type, description, urgency, latitude, longitude } = req.body
  const photos = req.files
  
  // Salvar no banco de dados
  console.log('Novo reporte:', { type, description, urgency, photos: photos.length })
  
  res.json({ success: true, id: Date.now() })
})

app.listen(3001)
```

### Opção 2: PHP Simples
```php
<?php
if ($_POST) {
    $type = $_POST['type'];
    $description = $_POST['description'];
    $urgency = $_POST['urgency'];
    
    // Processar fotos
    foreach ($_FILES as $file) {
        move_uploaded_file($file['tmp_name'], 'uploads/' . $file['name']);
    }
    
    // Salvar no banco
    // ... código do banco de dados
    
    echo json_encode(['success' => true]);
}
?>
```

## 📧 Configuração de Email

Para notificar a prefeitura por email:
```javascript
// Adicionar ao servidor
const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransporter({
  // Configuração do email da prefeitura
})

// Enviar email quando receber reporte
transporter.sendMail({
  to: 'obras@prefeitura.gov.br',
  subject: `Novo Reporte: ${type} - Urgência ${urgency}`,
  text: description,
  attachments: photos
})
```

## 🚀 Para Ativar o Envio Real

1. **Configure o servidor** da prefeitura
2. **Altere em `App.jsx`** a linha:
   ```javascript
   const ENDPOINT_URL = 'https://sua-prefeitura.gov.br/api/reportes'
   ```
3. **Descomente** o código de envio real
4. **Comente** a simulação

## 🔐 Segurança Recomendada

- ✅ HTTPS obrigatório
- ✅ Autenticação por token
- ✅ Validação de arquivos
- ✅ Limite de tamanho
- ✅ Rate limiting
- ✅ Backup automático

## 📱 Teste Local

Para testar localmente:
1. Execute `node servidor.js`
2. Mude `DEV_MODE.ENABLED = true` em `config.js`
3. Use `http://localhost:3001/api/reportes`
