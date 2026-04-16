# Quantity Measurement App - Frontend

A modern, responsive Angular application for unit conversion and arithmetic operations across different measurement types including length, weight, volume, and temperature.

## [![Angular](https://img.shields.io/badge/Angular-17.0.0-red.svg)](https://angular.io/) [![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-blue.svg)](https://www.typescriptlang.org/) [![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## Features

### Core Functionality
- **Unit Conversion**: Convert between different units within the same measurement type
- **Arithmetic Operations**: Perform addition, subtraction, multiplication, and division on quantities
- **Comparison Operations**: Compare different quantities and units
- **Operation History**: Track and view all previous operations with detailed results

### Supported Measurement Types
- **Length**: Feet, Inches, Yards, Centimeters
- **Weight**: Milligram, Gram, Kilogram, Pound, Tonne
- **Volume**: Litre, Millilitre, Gallon
- **Temperature**: Celsius, Fahrenheit

### User Features
- **Authentication**: Secure login and registration system
- **Google OAuth Integration**: Quick login with Google account
- **User Profile Management**: View and manage user information
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

## Technology Stack

### Frontend Framework
- **Angular 17.0.0** - Modern web framework with standalone components
- **TypeScript 5.2.2** - Type-safe JavaScript development
- **Angular Router** - Client-side routing and navigation
- **Angular Forms** - Reactive forms for user input handling

### Development Tools
- **Angular CLI** - Command-line interface for project management
- **Karma & Jasmine** - Unit testing framework
- **Angular DevKit** - Build and development tools

### Architecture
- **Modular Structure**: Feature-based organization with core, shared, and feature modules
- **Services**: Dependency injection for business logic separation
- **Guards & Interceptors**: Authentication and HTTP request handling
- **Type-safe Models**: Comprehensive TypeScript interfaces for data structures

## Project Structure

```
qm-frontend/
src/
 app/
  core/                    # Core application logic
   guards/                 # Route guards (auth.guard.ts)
   interceptors/           # HTTP interceptors (auth.interceptor.ts)
   models/                 # TypeScript interfaces and types (models.ts)
   services/               # Business logic services (auth.service.ts, measurement.service.ts)
  
  features/                # Feature modules
   auth/                   # Authentication components
   converter/              # Unit converter interface
   history/                # Operation history display
  
  app.component.ts         # Root application component
  app.config.ts            # Application configuration
  app.routes.ts            # Routing configuration
  
 environments/             # Environment configurations
  environment.ts
  environment.prod.ts
  
 styles.scss               # Global styles
 index.html                # Main HTML template
 main.ts                   # Application bootstrap
```

## Installation & Setup

### Prerequisites
- **Node.js** (v16.x or higher)
- **npm** (v8.x or higher) or **yarn** (v1.22.x or higher)

### Clone the Repository
```bash
git clone https://github.com/prakharsrivasofficial15/QuantityMeasurementApp_Frontend.git
cd QuantityMeasurementApp_Frontend/qm-frontend
```

### Install Dependencies
```bash
npm install
# or
yarn install
```

### Environment Configuration
Create or update environment files in `src/environments/`:

**development** (`src/environments/environment.ts`):
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api', // Your backend API URL
  googleClientId: 'your-google-client-id'
};
```

**production** (`src/environments/environment.prod.ts`):
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-api-domain.com/api',
  googleClientId: 'your-production-google-client-id'
};
```

## Running the Application

### Development Server
```bash
ng serve
# or
npm start
```
Navigate to `http://localhost:4200/` in your browser.

### Production Build
```bash
ng build
# or
npm run build
```
The build artifacts will be stored in the `dist/` directory.

### Watch Mode
```bash
ng build --watch --configuration development
# or
npm run watch
```

### Testing
```bash
# Unit tests
ng test
# or
npm test

# End-to-end tests (if configured)
ng e2e
```

## API Integration

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/google` - Google OAuth login
- `GET /api/auth/profile` - Get user profile

### Measurement Endpoints
- `POST /api/measurements/convert` - Unit conversion
- `POST /api/measurements/add` - Addition operation
- `POST /api/measurements/subtract` - Subtraction operation
- `POST /api/measurements/multiply` - Multiplication operation
- `POST /api/measurements/divide` - Division operation
- `POST /api/measurements/compare` - Comparison operation
- `GET /api/measurements/history` - Operation history

### Request/Response Models
The application uses strongly-typed TypeScript interfaces defined in `src/app/core/models/models.ts`:

**Conversion Request**:
```typescript
interface ConvertRequest {
  quantity: QuantityInput;
  targetUnit: string;
}
```

**Measurement Response**:
```typescript
interface MeasurementResponse {
  value: number;
  unit: string;
  type: string;
  success: boolean;
  error?: string;
}
```

## Deployment

### Build for Production
```bash
ng build --configuration production
```

### Deployment Options

#### 1. Static Hosting (GitHub Pages, Netlify, Vercel)
```bash
# Deploy to GitHub Pages
npm install -g angular-cli-ghpages
ng build --configuration production --base-href "https://username.github.io/repository-name/"
ngh --dir dist/qm-frontend
```

#### 2. Docker Deployment
Create a `Dockerfile`:
```dockerfile
FROM nginx:alpine
COPY dist/qm-frontend /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### 3. Cloud Deployment
- **AWS S3 + CloudFront** for static hosting
- **Firebase Hosting** for seamless deployment
- **Azure Static Web Apps** for integrated CI/CD

## Contributing

### Development Guidelines
1. Follow Angular Style Guide
2. Use TypeScript strict mode
3. Write unit tests for new features
4. Maintain consistent code formatting
5. Update documentation for API changes

### Git Workflow
1. Create feature branch: `git checkout -b feature/your-feature-name`
2. Make changes and commit: `git commit -m "feat: add your feature"`
3. Push to branch: `git push origin feature/your-feature-name`
4. Create Pull Request

### Code Quality
```bash
# Linting
ng lint

# Formatting (if configured)
npx prettier --write src/

# Type checking
npx tsc --noEmit
```

## Troubleshooting

### Common Issues

**Build Errors**:
```bash
# Clear cache
ng cache clean
rm -rf node_modules package-lock.json
npm install
```

**Development Server Issues**:
```bash
# Check port availability
netstat -an | grep 4200

# Use different port
ng serve --port 4300
```

**CORS Issues**:
Ensure your backend API allows requests from your frontend domain:
```typescript
// Backend CORS configuration
app.use(cors({
  origin: ['http://localhost:4200', 'https://yourdomain.com']
}));
```

## Performance Optimization

### Build Optimization
- Enable AOT compilation: `ng build --aot`
- Use lazy loading for feature modules
- Optimize bundle size with bundle analysis
- Implement service worker for PWA capabilities

### Runtime Optimization
- Use OnPush change detection strategy
- Implement proper unsubscribe patterns
- Optimize HTTP requests with caching
- Use trackBy in ngFor loops

## Security Considerations

- **Authentication**: JWT tokens with proper expiration
- **HTTPS**: Enforce SSL in production
- **CORS**: Configure proper cross-origin policies
- **Input Validation**: Sanitize all user inputs
- **Dependency Updates**: Regular security patch updates

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- Create an issue in the GitHub repository
- Check the [documentation](https://angular.io/docs)
- Review the [Angular Style Guide](https://angular.io/guide/styleguide)

---

**Built with Angular 17** | **TypeScript 5.2** | **Modern Web Standards**
