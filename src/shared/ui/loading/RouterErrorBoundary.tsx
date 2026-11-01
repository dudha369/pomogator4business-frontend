import {
  isRouteErrorResponse,
  useLocation,
  useNavigate,
  useRouteError,
} from 'react-router-dom';
import { ErrorScreen, type ErrorType } from './ErrorScreen';
import { isNetworkError } from '../../lib/apiErrors';
import { useLocale } from '@/i18n';
import { ROUTES } from '../../constants/routes';

function classifyRouteError(error: unknown): ErrorType {
  if (isRouteErrorResponse(error) && error.status === 404) return 'not_found';
  return isNetworkError(error) ? 'network' : 'general';
}

export const RouterErrorBoundary = () => {
  const error = useRouteError();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLocale();

  console.error('Router error caught:', error);

  const errorType = classifyRouteError(error);

  const handleRetry = () => {
    if (errorType === 'not_found') {
      navigate(ROUTES.home, { replace: true });
    } else if (errorType === 'network') {
      window.location.reload();
    } else {
      navigate(location.pathname, { replace: true });
    }
  };

  return (
    <ErrorScreen
      errorType={errorType}
      onRetry={handleRetry}
      retryLabel={errorType === 'not_found' ? t('buttons.home') : undefined}
    />
  );
};
