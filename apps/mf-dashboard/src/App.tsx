import DashboardWidget from './DashboardWidget'
import styles from './App.module.css'

export default function App() {
  return (
    <div className={`${styles.appContainer} p-8 max-w-5xl mx-auto`}>
      <DashboardWidget />
    </div>
  )
}
