import { useRouter } from 'next/router';
import classnames from 'classnames';
import Head from 'next/head';
import Link from 'next/link';
import { BackLink, Snippet, Col, Row } from '../';
import styles from './style.module.scss';

export default function Home({ children, ...props }) {
  useRouter();
  return (
    <div className={styles.container}>
      <Head>
        <title>
          <Snippet>title</Snippet>
        </title>
        <link rel="icon" sizes="192x192" href="/favicon-192x192.png" />
      </Head>
      <a className="nhsuk-skip-link" href="#maincontent">
        Skip to main content
      </a>

      <header className={classnames('nhsuk-header', styles.header)} role="banner">
        <div className="nhsuk-width-container nhsuk-header__container">
          <Row>
            <Col colspan={2}>
              <div className="nhsuk-header__logo">
                <Link href="/">
                  <a
                    className="nhsuk-header__link nhsuk-header__link--service"
                    aria-label="NHS homepage"
                  >
                    <img className={styles.logo} src="/care-logo.svg" alt="Care logo" />
                    <span className="nhsuk-header__service-name">
                      Find assured suppliers of digital social care records
                    </span>
                  </a>
                </Link>
              </div>
            </Col>
          </Row>
        </div>
      </header>

      <div className="nhsuk-width-container">
        <br />
        <BackLink />
        <main className={styles.main} id="maincontent" role="main">
          {children}
        </main>
      </div>

      <footer role="contentinfo">
        <div className="nhsuk-footer" id="nhsuk-footer">
          <div className="nhsuk-width-container">
            <p className="nhsuk-footer__copyright">&copy; Crown copyright</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
