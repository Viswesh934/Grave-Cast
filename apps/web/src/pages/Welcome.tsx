import { type Page } from '../App';

export function Welcome({ onNavigate }: { onNavigate: (page: Page) => void }) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-6xl font-bold mb-4">⚰️ Grave-UI</h1>
        <p className="text-2xl text-stone-400 mb-2">v0.1.0</p>
        <p className="text-lg text-stone-500">
          Horror-themed React component library with radical reusability
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-12">
        <div className="border border-stone-800 rounded-lg p-6 bg-stone-900">
          <h2 className="text-xl font-bold mb-2">🎨 Design Tokens</h2>
          <p className="text-stone-400 mb-4">
            Complete horror-themed design system with colors, shadows, typography, animations
          </p>
          <button
            onClick={() => onNavigate('tokens')}
            className="text-red-500 hover:text-red-400"
          >
            View Tokens →
          </button>
        </div>

        <div className="border border-stone-800 rounded-lg p-6 bg-stone-900">
          <h2 className="text-xl font-bold mb-2">🪝 Hooks</h2>
          <p className="text-stone-400 mb-4">
            4 reusable hooks including horror hover effects and Web Audio integration
          </p>
          <button
            onClick={() => onNavigate('hooks')}
            className="text-red-500 hover:text-red-400"
          >
            View Hooks →
          </button>
        </div>

        <div className="border border-stone-800 rounded-lg p-6 bg-stone-900">
          <h2 className="text-xl font-bold mb-2">🧱 Primitives</h2>
          <p className="text-stone-400 mb-4">
            Button, Card, Badge components - the building blocks
          </p>
          <button
            onClick={() => onNavigate('primitives')}
            className="text-red-500 hover:text-red-400"
          >
            View Primitives →
          </button>
        </div>

        <div className="border border-stone-800 rounded-lg p-6 bg-stone-900">
          <h2 className="text-xl font-bold mb-2">⚰️ Crypt Components</h2>
          <p className="text-stone-400 mb-4">
            6 horror-themed components demonstrating compound patterns and render props
          </p>
          <button
            onClick={() => onNavigate('crypt')}
            className="text-red-500 hover:text-red-400"
          >
            View Components →
          </button>
        </div>
      </div>

      <div className="border border-stone-700 rounded-lg p-8 bg-stone-800/50">
        <h2 className="text-2xl font-bold mb-4">Features</h2>
        <ul className="space-y-3 text-stone-300">
          <li className="flex items-start">
            <span className="text-red-500 mr-2">▸</span>
            <div>
              <strong>Horror-Themed:</strong> Dark, gothic aesthetic for spooky experiences
            </div>
          </li>
          <li className="flex items-start">
            <span className="text-red-500 mr-2">▸</span>
            <div>
              <strong>Composable:</strong> Mix and match components to build custom layouts
            </div>
          </li>
          <li className="flex items-start">
            <span className="text-red-500 mr-2">▸</span>
            <div>
              <strong>Flexible:</strong> Advanced patterns like compound components and portals
            </div>
          </li>
          <li className="flex items-start">
            <span className="text-red-500 mr-2">▸</span>
            <div>
              <strong>TypeScript:</strong> Full type safety out of the box
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
}
