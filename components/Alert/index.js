import { useAlertContext } from '../../context/alert';

import styles from './style.module.scss';

export default function Alert() {

  const { message, state, clearAlert } = useAlertContext();

  if (!message) {
    return null;
  }

  return (
    <div className={`${styles.alert} ${styles['alert-' + state]}`} key="alert" onClick={clearAlert} >
      <div className="nhsuk-width-container">
        <p>{ message }</p>
      </div>
    </div>
  )
}
