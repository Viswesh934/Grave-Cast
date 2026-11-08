import { Button, Card, Badge } from '@gravecast/grave-ui';

export function PrimitivesShowcase() {
  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold">🧱 Primitives</h1>
      <section>
        <h2 className="text-2xl font-bold mb-4">Button</h2>
        <div className="flex gap-4">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
        </div>
      </section>
      <section>
        <h2 className="text-2xl font-bold mb-4">Card</h2>
        <div className="grid md:grid-cols-2 gap-4 max-w-2xl">
          <Card variant="flat" padding="md">
            <h3 className="font-bold mb-2">Flat Card</h3>
            <p className="text-sm text-stone-400">Minimal elevation</p>
          </Card>
          <Card variant="elevated" padding="md">
            <h3 className="font-bold mb-2">Elevated Card</h3>
            <p className="text-sm text-stone-400">With shadow</p>
          </Card>
        </div>
      </section>
      <section>
        <h2 className="text-2xl font-bold mb-4">Badge</h2>
        <div className="flex gap-4">
          <Badge variant="default">Default</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="danger">Danger</Badge>
          <Badge variant="info">Info</Badge>
        </div>
      </section>
    </div>
  );
}
