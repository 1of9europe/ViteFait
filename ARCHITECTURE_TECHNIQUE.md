# 🏗️ Architecture Technique - ViteFait

## 🎯 Vue d'ensemble architecturale

ViteFait suit une architecture **monorepo** avec **microservices** et **API-first**, permettant un développement agile et une maintenance efficace.

```
┌─────────────────────────────────────────────────────────────┐
│                    ViteFait Monorepo                        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Backend   │  │     Web     │  │   Mobile    │         │
│  │   API       │  │   Client    │  │     App     │         │
│  │  Node.js    │  │   React     │  │ React Native│         │
│  │ TypeScript  │  │   Vite      │  │  TypeScript │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

## 🔧 Architecture Backend

### 🏛️ Pattern Architectural
- **Clean Architecture** : Séparation des couches
- **Domain-Driven Design** : Modélisation métier
- **Repository Pattern** : Abstraction de la persistance
- **Service Layer** : Logique métier centralisée

### 📁 Structure des couches

```
backend/src/
├── controllers/     # Contrôleurs HTTP
├── services/        # Logique métier
├── repositories/    # Accès aux données
├── entities/        # Modèles de données
├── middlewares/     # Middlewares Express
├── routes/          # Définition des routes
├── utils/           # Utilitaires
├── config/          # Configuration
└── types/           # Types TypeScript
```

### 🔄 Flux de données

```
HTTP Request → Controller → Service → Repository → Database
                ↓
HTTP Response ← Controller ← Service ← Repository ← Database
```

### 🗄️ Base de données

#### Schéma principal
```sql
-- Utilisateurs
users (
  id, email, password_hash, first_name, last_name,
  role, phone, avatar, created_at, updated_at
)

-- Missions
missions (
  id, title, description, status, priority,
  category, budget, duration_min, duration_max,
  pickup_address, drop_address, scheduled_date,
  client_id, concierge_id, created_at, updated_at
)

-- Paiements
payments (
  id, mission_id, amount, status, method,
  stripe_payment_intent_id, created_at, updated_at
)

-- Messages
chat_messages (
  id, mission_id, sender_id, content, type,
  created_at
)
```

#### Relations
- **User** → **Mission** (1:N) - Client/Concierge
- **Mission** → **Payment** (1:N) - Paiements multiples
- **Mission** → **ChatMessage** (1:N) - Conversation

### 🔐 Authentification & Autorisation

#### JWT Strategy
```typescript
interface JWTPayload {
  userId: string;
  email: string;
  role: 'client' | 'admin' | 'concierge';
  iat: number;
  exp: number;
}
```

#### Middleware d'authentification
```typescript
const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Token manquant' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded as JWTPayload;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token invalide' });
  }
};
```

#### Contrôle d'accès par rôle
```typescript
const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Accès refusé' });
    }
    next();
  };
};
```

## 🌐 Architecture Web

### 🏗️ Structure React

```
web/src/
├── components/      # Composants réutilisables
│   ├── ui/         # Composants UI de base
│   └── forms/      # Composants de formulaires
├── pages/          # Pages de l'application
├── layouts/        # Layouts et templates
├── store/          # Redux store et slices
├── services/       # Services API
├── hooks/          # Hooks personnalisés
├── utils/          # Utilitaires
└── types/          # Types TypeScript
```

### 🔄 Gestion d'état (Redux Toolkit)

#### Store Configuration
```typescript
const store = configureStore({
  reducer: {
    auth: authReducer,
    missions: missionsReducer,
    payments: paymentsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});
```

#### Slice Pattern
```typescript
const missionsSlice = createSlice({
  name: 'missions',
  initialState,
  reducers: {
    fetchMissionsStart: (state) => {
      state.loading = true;
    },
    fetchMissionsSuccess: (state, action) => {
      state.missions = action.payload;
      state.loading = false;
    },
    fetchMissionsFailure: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});
```

### 🛣️ Routing (React Router)

#### Structure des routes
```typescript
<Routes>
  {/* Routes publiques */}
  <Route path="/login" element={<Login />} />
  
  {/* Routes protégées */}
  <Route path="/" element={
    <ProtectedRoute>
      <MainLayout>
        <Dashboard />
      </MainLayout>
    </ProtectedRoute>
  } />
  
  <Route path="/missions" element={
    <ProtectedRoute>
      <MainLayout>
        <Missions />
      </MainLayout>
    </ProtectedRoute>
  } />
</Routes>
```

#### Guard de routes
```typescript
const ProtectedRoute = ({ children, requireAuth = true, roles = [] }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!requireAuth) return <>{children}</>;
  
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  if (roles.length > 0 && user && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};
```

### 🎨 Styling (Tailwind CSS)

#### Configuration
```javascript
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { /* palette personnalisée */ },
        secondary: { /* palette personnalisée */ },
      },
    },
  },
  plugins: [],
};
```

#### Composants réutilisables
```typescript
const Button = ({ variant = 'primary', size = 'md', children, ...props }) => {
  const classes = cn(
    buttonVariants({ variant, size }),
    props.className
  );
  
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
};
```

## 📱 Architecture Mobile

### 🏗️ Structure React Native

```
mobile/src/
├── components/      # Composants réutilisables
├── screens/         # Écrans de l'application
├── navigation/      # Configuration de navigation
├── store/           # Redux store
├── services/        # Services API
├── hooks/           # Hooks personnalisés
├── utils/           # Utilitaires
└── types/           # Types TypeScript
```

### 🧭 Navigation (React Navigation)

#### Stack Navigator
```typescript
const AuthStack = createStackNavigator();

const AuthNavigator = () => (
  <AuthStack.Navigator>
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Register" component={RegisterScreen} />
  </AuthStack.Navigator>
);
```

#### Tab Navigator
```typescript
const MainTabs = createBottomTabNavigator();

const MainTabNavigator = () => (
  <MainTabs.Navigator>
    <MainTabs.Screen name="Dashboard" component={DashboardScreen} />
    <MainTabs.Screen name="Missions" component={MissionsScreen} />
    <MainTabs.Screen name="Profile" component={ProfileScreen} />
  </MainTabs.Navigator>
);
```

### 🔄 Gestion d'état (Redux Toolkit)

#### Store Configuration
```typescript
const store = configureStore({
  reducer: {
    auth: authReducer,
    missions: missionsReducer,
    location: locationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});
```

### 📍 Géolocalisation

#### Service de localisation
```typescript
class LocationService {
  static async getCurrentPosition(): Promise<Position> {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (position) => resolve(position),
        (error) => reject(error),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    });
  }
  
  static watchPosition(callback: (position: Position) => void) {
    return Geolocation.watchPosition(callback, null, {
      enableHighAccuracy: true,
      distanceFilter: 10,
    });
  }
}
```

## 🔌 Communication Inter-Services

### 🌐 API REST

#### Endpoints principaux
```
GET    /api/auth/profile          # Profil utilisateur
POST   /api/auth/login            # Connexion
POST   /api/auth/refresh          # Refresh token

GET    /api/missions              # Liste des missions
POST   /api/missions              # Créer une mission
GET    /api/missions/:id          # Détails d'une mission
PUT    /api/missions/:id          # Modifier une mission
PATCH  /api/missions/:id/status   # Changer le statut

GET    /api/payments              # Historique des paiements
POST   /api/payments/create-intent # Créer un paiement
POST   /api/payments/confirm      # Confirmer un paiement

GET    /api/chat/:missionId       # Messages d'une mission
POST   /api/chat/:missionId       # Envoyer un message
```

#### Intercepteurs Axios
```typescript
// Ajout automatique du token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Gestion des erreurs 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Tentative de refresh token
      const newToken = await refreshToken();
      if (newToken) {
        // Rejouer la requête
        return api(error.config);
      } else {
        // Redirection vers login
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
```

### 🔄 WebSocket (Socket.IO)

#### Configuration serveur
```typescript
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST'],
  },
});

io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    socket.userId = decoded.userId;
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
});
```

#### Événements
```typescript
// Événements côté serveur
io.on('connection', (socket) => {
  socket.on('join-mission', (missionId) => {
    socket.join(`mission-${missionId}`);
  });
  
  socket.on('send-message', async (data) => {
    const message = await saveMessage(data);
    io.to(`mission-${data.missionId}`).emit('new-message', message);
  });
  
  socket.on('mission-status-update', (data) => {
    io.to(`mission-${data.missionId}`).emit('status-updated', data);
  });
});
```

#### Client Web
```typescript
const socket = io(process.env.VITE_SOCKET_URL, {
  auth: {
    token: localStorage.getItem('token'),
  },
});

socket.on('new-message', (message) => {
  dispatch(addMessage(message));
});

socket.on('status-updated', (data) => {
  dispatch(updateMissionStatus(data));
});
```

## 🗄️ Persistance des données

### 📊 Base de données (PostgreSQL)

#### Configuration TypeORM
```typescript
const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [__dirname + '/entities/*.ts'],
  migrations: [__dirname + '/migrations/*.ts'],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
});
```

#### Entités TypeORM
```typescript
@Entity('missions')
export class Mission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'in_progress', 'completed', 'cancelled'],
    default: 'pending',
  })
  status: MissionStatus;

  @ManyToOne(() => User, (user) => user.missions)
  client: User;

  @ManyToOne(() => User, (user) => user.assignedMissions)
  concierge: User;

  @OneToMany(() => Payment, (payment) => payment.mission)
  payments: Payment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### 💾 Cache (Redis - optionnel)

#### Configuration Redis
```typescript
const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT),
  password: process.env.REDIS_PASSWORD,
});

// Cache des sessions utilisateur
const cacheUserSession = async (userId: string, sessionData: any) => {
  await redis.setex(`session:${userId}`, 3600, JSON.stringify(sessionData));
};

// Cache des missions populaires
const cachePopularMissions = async (missions: Mission[]) => {
  await redis.setex('popular-missions', 1800, JSON.stringify(missions));
};
```

## 🔒 Sécurité

### 🛡️ Authentification

#### Hashage des mots de passe
```typescript
const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
};

const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};
```

#### Génération de tokens
```typescript
const generateTokens = (user: User) => {
  const accessToken = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { userId: user.id },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};
```

### 🔐 Autorisation

#### Middleware de vérification des rôles
```typescript
const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user.role;
    
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        message: 'Accès refusé. Rôle insuffisant.',
        required: allowedRoles,
        current: userRole,
      });
    }
    
    next();
  };
};

// Utilisation
router.get('/admin/users', 
  authMiddleware, 
  requireRole(['admin']), 
  userController.getAllUsers
);
```

### 🌐 Sécurité Web

#### Headers de sécurité (Helmet)
```typescript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));
```

#### Rate Limiting
```typescript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limite par IP
  message: 'Trop de requêtes depuis cette IP',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);
```

## 🧪 Tests

### 🔬 Tests Unitaires

#### Backend (Jest)
```typescript
describe('MissionService', () => {
  let missionService: MissionService;
  let mockRepository: jest.Mocked<Repository<Mission>>;

  beforeEach(() => {
    mockRepository = createMockRepository();
    missionService = new MissionService(mockRepository);
  });

  it('should create a new mission', async () => {
    const missionData = {
      title: 'Test Mission',
      description: 'Test Description',
      clientId: 'client-id',
    };

    mockRepository.save.mockResolvedValue({
      id: 'mission-id',
      ...missionData,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await missionService.createMission(missionData);

    expect(result.title).toBe(missionData.title);
    expect(result.status).toBe('pending');
    expect(mockRepository.save).toHaveBeenCalledWith(expect.objectContaining(missionData));
  });
});
```

#### Web (Vitest + React Testing Library)
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from '../store/store';
import Login from './Login';

describe('Login Component', () => {
  it('should handle form submission', async () => {
    render(
      <Provider store={store}>
        <Login />
      </Provider>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/mot de passe/i);
    const submitButton = screen.getByRole('button', { name: /se connecter/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    expect(screen.getByText(/connexion en cours/i)).toBeInTheDocument();
  });
});
```

### 🔗 Tests d'Intégration

#### API Tests (Supertest)
```typescript
describe('Missions API', () => {
  let app: Express;
  let authToken: string;

  beforeAll(async () => {
    app = createApp();
    authToken = await generateTestToken();
  });

  it('should create a new mission', async () => {
    const missionData = {
      title: 'Test Mission',
      description: 'Test Description',
      category: 'delivery',
      budget: 50,
    };

    const response = await request(app)
      .post('/api/missions')
      .set('Authorization', `Bearer ${authToken}`)
      .send(missionData)
      .expect(201);

    expect(response.body.title).toBe(missionData.title);
    expect(response.body.status).toBe('pending');
  });
});
```

### 🎯 Tests E2E

#### Backend (Karate)
```gherkin
Feature: Mission Management

Scenario: Create a new mission
  Given url baseUrl + '/api/missions'
  And header Authorization = 'Bearer ' + token
  When request { title: 'Test Mission', description: 'Test Description' }
  And method POST
  Then status 201
  And match response contains { title: 'Test Mission', status: 'pending' }
```

#### Web (Playwright)
```typescript
import { test, expect } from '@playwright/test';

test('should create a new mission', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[data-testid="email"]', 'test@example.com');
  await page.fill('[data-testid="password"]', 'password123');
  await page.click('[data-testid="login-button"]');

  await page.waitForURL('/dashboard');
  await page.click('[data-testid="new-mission-button"]');

  await page.fill('[data-testid="mission-title"]', 'Test Mission');
  await page.fill('[data-testid="mission-description"]', 'Test Description');
  await page.click('[data-testid="next-step"]');

  await page.click('[data-testid="create-mission"]');
  
  await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
});
```

## 📊 Monitoring & Logs

### 📝 Logging

#### Configuration Winston
```typescript
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}
```

### 📈 Métriques

#### Health Checks
```typescript
app.get('/health', async (req, res) => {
  try {
    // Vérifier la base de données
    await dataSource.query('SELECT 1');
    
    // Vérifier Redis (si utilisé)
    await redis.ping();
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
    });
  }
});
```

## 🚀 Performance

### ⚡ Optimisations Backend

#### Cache des requêtes
```typescript
const cacheMiddleware = (duration: number = 300) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const key = `cache:${req.originalUrl}`;
    const cached = await redis.get(key);
    
    if (cached) {
      return res.json(JSON.parse(cached));
    }
    
    const originalSend = res.json;
    res.json = function(data) {
      redis.setex(key, duration, JSON.stringify(data));
      return originalSend.call(this, data);
    };
    
    next();
  };
};
```

#### Pagination
```typescript
const paginateResults = (page: number = 1, limit: number = 10) => {
  const offset = (page - 1) * limit;
  
  return {
    offset,
    limit,
    page,
  };
};

// Utilisation dans le repository
const getMissions = async (filters: any, pagination: any) => {
  const { offset, limit } = paginateResults(pagination.page, pagination.limit);
  
  const [missions, total] = await missionRepository.findAndCount({
    where: filters,
    skip: offset,
    take: limit,
    order: { createdAt: 'DESC' },
  });
  
  return {
    missions,
    total,
    page: pagination.page,
    totalPages: Math.ceil(total / limit),
  };
};
```

### 🎨 Optimisations Frontend

#### Lazy Loading
```typescript
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Missions = lazy(() => import('./pages/Missions'));
const Profile = lazy(() => import('./pages/Profile'));

const App = () => (
  <Suspense fallback={<LoadingSpinner />}>
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/missions" element={<Missions />} />
      <Route path="/profile" element={<Profile />} />
    </Routes>
  </Suspense>
);
```

#### Memoization
```typescript
const MissionCard = memo(({ mission }: { mission: Mission }) => {
  return (
    <div className="mission-card">
      <h3>{mission.title}</h3>
      <p>{mission.description}</p>
      <StatusBadge status={mission.status} />
    </div>
  );
});

const MissionList = () => {
  const missions = useSelector((state) => state.missions.list);
  
  return (
    <div className="mission-list">
      {missions.map((mission) => (
        <MissionCard key={mission.id} mission={mission} />
      ))}
    </div>
  );
};
```

## 🔄 CI/CD

### 🏗️ Pipeline GitHub Actions

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm run install:all
      
      - name: Run tests
        run: npm run test
      
      - name: Run linting
        run: npm run lint
      
      - name: Build applications
        run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to production
        run: |
          echo "Deploying to production..."
          # Scripts de déploiement
```

---

## 🎉 Conclusion

L'architecture technique de ViteFait est conçue pour être :

- **Scalable** : Monorepo avec séparation claire des responsabilités
- **Maintenable** : Code modulaire avec tests complets
- **Sécurisée** : Authentification JWT, validation, rate limiting
- **Performante** : Cache, pagination, optimisations frontend
- **Robuste** : Monitoring, logs, health checks

Cette architecture permet un développement agile et une évolution continue de l'application. 🚀 