export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <h2 className="text-2xl mb-6">页面未找到</h2>
      <p className="text-gray-600 mb-8">您请求的页面不存在或已被移除。</p>
      <a 
        href="/import" 
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        返回首页
      </a>
    </div>
  )
}
