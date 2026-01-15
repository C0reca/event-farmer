# Verificação de Contraste - WCAG AA

## Padrões WCAG:
- Texto normal: 4.5:1
- Texto grande (18pt+ ou 14pt+ bold): 3:1

## Cores Base:
- Primary Blue: #1F4FFF
- Dark Navy: #0E1424
- Soft White: #F7F9FC
- Light Grey: #E5E8EF
- Accent Green: #2ED47A

## Verificações Necessárias:

1. **Hero Section**
   - ✅ Branco (#FFFFFF) sobre Navy-900 (#0E1424) = 15.8:1 (Excelente)
   - ⚠️ Branco/90 (#FFFFFF 90%) sobre gradiente = Precisa verificar no ponto mais claro
   - ⚠️ Branco/80 (#FFFFFF 80%) sobre gradiente = Precisa verificar

2. **Seção Problema**
   - ✅ Navy-900 (#0E1424) sobre White-Soft (#F7F9FC) = 15.1:1 (Excelente)
   - ✅ Navy-700 sobre White-Soft = Bom contraste

3. **Seção Solução**
   - ⚠️ Navy-900 (#0E1424) sobre Grey (#E5E8EF) = ~8.2:1 (Bom, mas verificar)
   - ✅ Navy-900 sobre White = 15.1:1 (Excelente)

4. **Seção Experiências**
   - ✅ Branco sobre Navy-900 = 15.8:1 (Excelente)

5. **Seção Porquê TeamSync**
   - ⚠️ Navy-900 (#0E1424) sobre Primary-50 (#EEF2FF) = ~6.8:1 (Bom para texto grande, verificar texto normal)

6. **Footer**
   - ⚠️ Grey-300 sobre Navy-900 = Precisa verificar (pode ser baixo)
   - ⚠️ Grey-400 sobre Navy-900 = Precisa verificar

## Ajustes Necessários:

1. Hero: Aumentar opacidade de texto secundário
2. Footer: Escurecer texto cinza ou usar branco
3. Porquê TeamSync: Verificar se texto normal precisa ser mais escuro
