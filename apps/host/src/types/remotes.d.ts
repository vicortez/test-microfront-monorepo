declare module 'mfDashboard/DashboardWidget' {
  import * as React from 'react'
  export interface DashboardWidgetProps {
    onRefresh?: () => void
  }
  const DashboardWidget: React.ComponentType<DashboardWidgetProps>
  export default DashboardWidget
}

declare module 'mfChat/ChatWidget' {
  import * as React from 'react'
  const ChatWidget: React.ComponentType
  export default ChatWidget
}
