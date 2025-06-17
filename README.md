# RoboConfig - Robotics Configuration & Risk Assessment Platform

[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-2.39-3FCF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com/)
[![Netlify](https://img.shields.io/badge/Netlify-Deployed-00C7B7?style=flat-square&logo=netlify&logoColor=white)](https://roboconfig.netlify.app)
[![OpenAI](https://img.shields.io/badge/OpenAI-Powered-412991?style=flat-square&logo=openai&logoColor=white)](https://openai.com/)

RoboConfig is a modern web application for managing and assessing robotics systems, components, and their associated risks. It provides a comprehensive solution for robotics engineers and manufacturers to configure machines, track maintenance, and perform risk assessments.

🔗 **[Live Demo](https://roboconfig.netlify.app)**

## Features

- 🤖 **Machine Management**: Create and manage robotic systems with detailed configurations
- 🔧 **Component Library**: Extensive library of robotics components with specifications
- 🛡️ **Risk Assessment**: Built-in risk assessment tools for components and systems
- 📊 **Maintenance Tracking**: Schedule and monitor maintenance tasks
- 📦 **Inventory Management**: Track component stock levels, suppliers, and purchase orders
- 🤝 **Organization Management**: Create and manage organizations with team members
- 🧠 **AI Assistance**: AI-powered assistants for configuration, risk assessment, and inventory
- 📱 **Responsive Design**: Full mobile and desktop support
- 🔐 **Secure Authentication**: Email/password and Google OAuth authentication with Supabase
- 💳 **Subscription Management**: Premium features with Stripe integration

## Current Development Status

The application is deployed and ready to use with the following features implemented:

✅ **Completed Features**:
- User authentication with Supabase (Email/Password and Google OAuth)
- Multi-organization support with team management
- Component management system with AI-assisted configuration
- Machine configuration interface with drag-and-drop component ordering
- Risk assessment tools with severity and probability tracking
- Maintenance scheduling and task management
- Inventory management with stock level tracking
- Supplier management and purchase order processing
- PDF report generation
- Stripe integration for subscriptions
- AI assistants for machine configuration, component selection, and inventory management
- Real-time database updates
- Mobile-responsive design
- Organization invitations and member management

## AI Assistants

RoboConfig features powerful AI assistants that transform how robotics engineers configure and manage systems:

- **Machine Configuration Assistant**: Helps design complete machine configurations based on requirements
  - Suggests optimal component combinations for specific use cases
  - Analyzes compatibility between components
  - Recommends maintenance schedules tailored to machine type and usage
  - Creates risk assessments with realistic severity and probability ratings

- **Component Specification Assistant**: Streamlines component creation and configuration
  - Provides detailed technical specifications based on component type
  - Suggests appropriate risk factors for components
  - Assists with compatibility considerations
  - Offers real-world parameter recommendations (voltage, torque, dimensions, etc.)

- **Inventory Management Assistant**: Optimizes stock management and procurement
  - Analyzes current inventory health and identifies critical shortages
  - Recommends optimal minimum stock levels based on usage patterns
  - Generates purchase order suggestions for restocking
  - Identifies high-turnover components and usage trends
  - Provides supplier recommendations for efficient procurement

- **Context-Aware Suggestions**: All assistants understand your current configuration
  - Leverages existing components in your organization when possible
  - Identifies potential issues in current configurations
  - Provides upgrade and optimization recommendations
  - Analyzes risk factors across the complete system

## Technology Stack

- **Frontend**:
  - React 18.3 with TypeScript 5.5
  - Vite 5.4 for blazing fast development
  - Tailwind CSS 3.4 for styling
  - Lucide React for beautiful icons
  - React Router for navigation
  - React PDF for report generation
  - React Beautiful DnD for drag-and-drop functionality
  - Chart.js for analytics visualization

- **Backend**:
  - Supabase for database and authentication
  - PostgreSQL with Row Level Security
  - Supabase Edge Functions for serverless computing

- **AI Integration**:
  - OpenAI API for intelligent assistants
  - Context-aware suggestions
  - Function calling for structured responses

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
   OPENAI_API_KEY=your-openai-api-key-here
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
│   │   ├── Auth/       # Authentication components
│   │   ├── ComponentForms/ # Forms for different component types
│   │   ├── Inventory/  # Inventory management components
│   │   ├── Layout/     # Layout components
│   │   ├── MachineForm/ # Machine creation/editing
│   │   ├── Reports/    # Report generation
│   │   └── UI/         # Reusable UI components
│   ├── context/        # React context providers
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utility functions and configurations
│   ├── pages/          # Page components
│   │   ├── Auth/       # Authentication pages
│   │   ├── ComponentTypes/ # Component type pages
│   │   └── Inventory/  # Inventory management pages
│   └── types/          # TypeScript type definitions
├── supabase/
│   ├── functions/      # Edge Functions
│   └── migrations/     # Database migrations
└── public/             # Static assets
```

## Key Features

### Component Management
- Categorized component library (Drive, Controller, Power, Communication, etc.)
- Detailed specifications tracking with AI-assisted configuration
- Risk factor assessment
- Component compatibility checking

### Machine Configuration
- Machine creation and management
- Component integration with drag-and-drop reordering
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

### Inventory Management
- Component stock level tracking
- Minimum quantity thresholds with low stock alerts
- Supplier information management
- Purchase order creation and tracking
- Inventory analytics and insights
- AI-assisted inventory optimization

### Organization Management
- Create and manage multiple organizations
- Invite team members
- Role-based permissions (Owner, Admin, Member)
- Organization-specific data isolation

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Supabase](https://supabase.com) for backend infrastructure
- [Stripe](https://stripe.com) for payment processing
- [OpenAI](https://openai.com) for AI assistance capabilities
- [Lucide](https://lucide.dev) for beautiful icons
- All our contributors and users