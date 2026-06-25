import { Component } from 'react';
import { Link } from 'react-router-dom';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center px-6 text-center">
          <div className="relative mb-6">
            <p className="font-display text-[120px] font-bold text-primary/10 leading-none select-none">
              500
            </p>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
                <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
              </div>
            </div>
          </div>

          <h1 className="font-display text-3xl font-bold mb-3">Oops! Có lỗi xảy ra</h1>
          <p className="text-text-muted mb-2 max-w-sm">
            Trang này gặp sự cố không mong muốn. Thử tải lại hoặc quay về trang chủ.
          </p>
          {import.meta.env.DEV && this.state.error && (
            <pre className="text-left text-xs bg-red-50 border border-red-200 rounded-xl p-4 mb-6 max-w-lg w-full overflow-auto text-red-600">
              {this.state.error.toString()}
            </pre>
          )}

          <div className="flex gap-3 mt-6">
            <button
              onClick={this.handleReset}
              className="btn-outline"
            >
              Thử lại
            </button>
            <Link to="/" className="btn-primary">
              Về trang chủ
            </Link>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
