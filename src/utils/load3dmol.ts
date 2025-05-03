let loaded = false;

export function load3Dmol(): Promise<any> {
  return new Promise((resolve, reject) => {
    if (loaded && window.$3Dmol) return resolve(window.$3Dmol);
    
    const script = document.createElement('script');
    script.src = '/_next/static/chunks/node_modules_3dmol_build_3Dmol-min.js'; 
    
    script.onload = () => {
      loaded = true;
      resolve(window.$3Dmol!);
    };
    
    script.onerror = () => reject(new Error('Failed to load 3Dmol'));
    document.head.append(script);
  });
}