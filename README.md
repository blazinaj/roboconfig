# RoboConfig - Robotics Configuration & Risk Assessment Platform

RoboConfig is a modern web application for managing and assessing robotics systems, components, and their associated risks. It provides a comprehensive solution for robotics engineers and manufacturers to configure machines, track maintenance, and perform risk assessments.

🔗 **[Live Demo](https://roboconfig.netlify.app)** | [Documentation](https://docs.roboconfig.com)

## Features

- 🤖 **Machine Management**: Create and manage robotic systems with detailed configurations
- 🔧 **Component Library**: Extensive library of robotics components with specifications
- 🛡️ **Risk Assessment**: Built-in risk assessment tools for components and systems
- 📊 **Maintenance Tracking**: Schedule and monitor maintenance tasks
- 📱 **Responsive Design**: Full mobile and desktop support
- 🔐 **Secure Authentication**: Email/password authentication with Supabase
- 💳 **Subscription Management**: Premium features with Stripe integration

## Technology Stack

- **Frontend**:
  - React 18 with TypeScript
  - Vite for blazing fast development
  - Tailwind CSS for styling
  - Lucide React for beautiful icons
  - React Router for navigation
  - React PDF for report generation

- **Backend**:
  - Supabase for database and authentication
  - PostgreSQL with Row Level Security
  - Supabase Edge Functions for serverless computing

- **Payment Processing**:
  - Stripe integration for subscriptions
  - Secure payment processing
  - Webhook handling

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/roboconfig.git
   cd roboconfig
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file with your Supabase and Stripe credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
roboconfig/
├── src/
│   ├── components/     # React components
│   ├── context/       # React context providers
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Utility functions and configurations
│   ├── pages/         # Page components
│   └── types/         # TypeScript type definitions
├── supabase/
│   ├── functions/     # Edge Functions
│   └── migrations/    # Database migrations
└── public/           # Static assets
```

## Key Features

### Component Management
- Categorized component library
- Detailed specifications tracking
- Risk factor assessment
- Component compatibility checking

### Machine Configuration
- Machine creation and management
- Component integration
- Status monitoring
- Maintenance scheduling

### Risk Assessment
- Component-level risk factors
- Machine-level risk assessment
- Risk factor severity and probability tracking
- Risk mitigation recommendations

### Maintenance Management
- Scheduled maintenance tasks
- Task priority levels
- Completion tracking
- Maintenance history

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue in the GitHub repository or contact our support team at support@roboconfig.com.

## Security

Please report any security vulnerabilities to security@roboconfig.com.

## Acknowledgments

- [Supabase](https://supabase.com) for backend infrastructure
- [Stripe](https://stripe.com) for payment processing
- [Lucide](https://lucide.dev) for beautiful icons
- All our contributors and users