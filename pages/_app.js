import '../styles/globals.scss'
import { PageContext } from '../context';
import { Layout as DefaultLayout } from '../components';

function MyApp({ Component, pageProps, props }) {
  const Layout = Component.Layout || DefaultLayout;
  return (
    <PageContext {...props} {...pageProps}>
      <Layout {...props} {...pageProps}>
        <Component {...props} {...pageProps} />
      </Layout>
    </PageContext>
  );
}

export default MyApp
