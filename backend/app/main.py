from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import auth, empresas, atividades, reservas, itinerarios, admin

# Criar tabelas
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="TeamEvents API",
    description="API para plataforma de eventos de equipa",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "http://0.0.0.0:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
from app.routers import fornecedores, avaliacoes

app.include_router(auth.router)
app.include_router(empresas.router)
app.include_router(fornecedores.router)
app.include_router(atividades.router)
app.include_router(reservas.router)
app.include_router(itinerarios.router)
app.include_router(admin.router)
app.include_router(avaliacoes.router)


@app.get("/")
def root():
    return {"message": "TeamEvents API - Welcome!"}


@app.on_event("startup")
async def startup_event():
    """Cria dados mock na primeira execução"""
    import sys
    from app.database import SessionLocal
    from app.models.user import User, TipoUsuario
    from app.models.empresa import Empresa
    from app.models.fornecedor import Fornecedor
    from app.models.atividade import Atividade
    from app.core.security import get_password_hash
    
    db = SessionLocal()
    try:
        # Verificar se já existem dados
        if db.query(User).first():
            print("ℹ️  Dados mock já existem, pulando criação...")
            return
        
        print("📦 Criando dados mock...")
        
        # Criar empresa mock
        empresa_password = "empresa123"
        user_empresa = User(
            nome="TechCorp",
            email="empresa@example.com",
            password=get_password_hash(empresa_password),
            tipo=TipoUsuario.EMPRESA
        )
        db.add(user_empresa)
        db.commit()
        db.refresh(user_empresa)
        print(f"✓ Empresa criada: {user_empresa.email}")
        
        empresa = Empresa(
            user_id=user_empresa.id,
            nome="TechCorp",
            setor="Tecnologia",
            n_funcionarios=50,
            localizacao="Lisboa",
            orcamento_medio=5000.0,
            preferencia_atividades="Atividades ao ar livre"
        )
        db.add(empresa)
        db.commit()
        print("✓ Perfil da empresa criado")
        
        # Criar fornecedor mock
        fornecedor_password = "fornecedor123"
        user_fornecedor = User(
            nome="Adventure Tours",
            email="fornecedor@example.com",
            password=get_password_hash(fornecedor_password),
            tipo=TipoUsuario.FORNECEDOR
        )
        db.add(user_fornecedor)
        db.commit()
        db.refresh(user_fornecedor)
        print(f"✓ Fornecedor criado: {user_fornecedor.email}")
        
        fornecedor = Fornecedor(
            user_id=user_fornecedor.id,
            nome="Adventure Tours",
            localizacao="Lisboa",
            descricao="Fornecedor de atividades de aventura",
            contacto="+351 123 456 789"
        )
        db.add(fornecedor)
        db.commit()
        db.refresh(fornecedor)
        print("✓ Perfil do fornecedor criado")
        
        # Criar admin mock
        admin_password = "admin123"
        user_admin = User(
            nome="Admin TeamEvents",
            email="admin@example.com",
            password=get_password_hash(admin_password),
            tipo=TipoUsuario.ADMIN
        )
        db.add(user_admin)
        db.commit()
        db.refresh(user_admin)
        print(f"✓ Admin criado: {user_admin.email}")
        
        # Criar atividades mock
        from app.models.atividade import EstadoAtividade
        
        atividades_mock = [
            {
                "nome": "Canoagem no Tejo",
                "tipo": "canoagem",
                "categoria": "aventura",
                "preco_por_pessoa": 25.0,
                "capacidade_max": 30,
                "localizacao": "Lisboa",
                "descricao": "Passeio de canoagem pelo rio Tejo com guia experiente",
                "imagens": '["https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800"]',
                "clima": "outdoor",
                "duracao_minutos": 120,
                "aprovada": True,
                "estado": EstadoAtividade.APROVADA
            },
            {
                "nome": "Passeio de Barco",
                "tipo": "barco",
                "categoria": "relax",
                "preco_por_pessoa": 40.0,
                "capacidade_max": 20,
                "localizacao": "Cascais",
                "descricao": "Passeio de barco pela costa de Cascais",
                "imagens": '["https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800"]',
                "clima": "outdoor",
                "duracao_minutos": 180,
                "aprovada": True,
                "estado": EstadoAtividade.APROVADA
            },
            {
                "nome": "Paintball",
                "tipo": "paintball",
                "categoria": "team_building",
                "preco_por_pessoa": 35.0,
                "capacidade_max": 40,
                "localizacao": "Sintra",
                "descricao": "Jogo de paintball em campo ao ar livre",
                "imagens": '["https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800"]',
                "clima": "outdoor",
                "duracao_minutos": 90,
                "aprovada": True,
                "estado": EstadoAtividade.APROVADA
            },
            {
                "nome": "Escalada",
                "tipo": "escalada",
                "categoria": "aventura",
                "preco_por_pessoa": 30.0,
                "capacidade_max": 15,
                "localizacao": "Sintra",
                "descricao": "Atividade de escalada em rocha com instrutores",
                "imagens": '["https://images.unsplash.com/photo-1544966503-7cc5315a0c8b?w=800"]',
                "clima": "outdoor",
                "duracao_minutos": 150,
                "aprovada": True,
                "estado": EstadoAtividade.APROVADA
            },
            {
                "nome": "Caminhada Guiada",
                "tipo": "caminhada",
                "categoria": "relax",
                "preco_por_pessoa": 15.0,
                "capacidade_max": 25,
                "localizacao": "Sintra",
                "descricao": "Caminhada pelas serras de Sintra com guia",
                "imagens": '["https://images.unsplash.com/photo-1551632811-561732d1e306?w=800"]',
                "clima": "outdoor",
                "duracao_minutos": 240,
                "aprovada": True,
                "estado": EstadoAtividade.APROVADA
            }
        ]
        
        atividades_criadas = 0
        for atividade_data in atividades_mock:
            try:
                atividade = Atividade(**atividade_data, fornecedor_id=fornecedor.id)
                db.add(atividade)
                atividades_criadas += 1
            except Exception as e:
                print(f"⚠️  Erro ao criar atividade {atividade_data.get('nome', 'desconhecida')}: {e}")
        
        db.commit()
        print(f"✓ {atividades_criadas} atividades criadas e aprovadas")
        print("✅ Dados mock criados com sucesso!")
        print(f"\n📝 Credenciais de teste:")
        print(f"   Empresa: empresa@example.com / {empresa_password}")
        print(f"   Fornecedor: fornecedor@example.com / {fornecedor_password}")
        print(f"   Admin: admin@example.com / {admin_password}")
        
    except Exception as e:
        print(f"❌ Erro ao criar dados mock: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

