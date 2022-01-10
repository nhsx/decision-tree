import styles from './style.module.scss';

export default function Actions({ children }) {
  return (
    <div className={styles.actions}>
      <p>{ children }</p>
    </div>
  )
}
