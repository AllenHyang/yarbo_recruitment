'use client';

export const runtime = 'edge';

export default function TestStylesPage() {
    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">样式测试页面</h1>
                <p className="text-gray-600">这是一个用于测试样式的页面。</p>
            </div>
        </div>
    );
}