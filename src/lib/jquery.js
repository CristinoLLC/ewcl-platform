import jquery from 'jquery';

if (typeof window !== 'undefined') {
  window.$ = window.jQuery = jquery;
}

export default jquery;