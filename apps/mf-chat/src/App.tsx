import ChatWidget from './ChatWidget'
import styles from './App.module.css'

export default function App() {
  return (
    <div className={`${styles.appContainer} p-8 max-w-xl mx-auto`}>
      <ChatWidget />
    </div>
  )
}
