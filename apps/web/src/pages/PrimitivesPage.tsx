import { Button, Card, Badge } from 'groove-ui';

export function PrimitivesPage() {
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-grave-bone-100 mb-2">
          Primitives
        </h1>
        <p className="text-grave-mist-400">
          Core building blocks for your interface
        </p>
      </div>

      {/* Button Component */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-grave-bone-100 mb-6">Button</h2>
        <Card>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary" size="sm">
              Primary Small
            </Button>
            <Button variant="primary" size="md">
              Primary Medium
            </Button>
            <Button variant="primary" size="lg">
              Primary Large
            </Button>
          </div>
          <div className="flex flex-wrap gap-4 mt-4">
            <Button variant="secondary" size="md">
              Secondary
            </Button>
            <Button variant="ghost" size="md">
              Ghost
            </Button>
          </div>
        </Card>
      </section>

      {/* Card Component */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-grave-bone-100 mb-6">Card</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-xl font-bold text-grave-bone-100 mb-2">
              Card Title
            </h3>
            <p className="text-grave-mist-300">
              A simple card component for containing content.
            </p>
          </Card>
          <Card>
            <h3 className="text-xl font-bold text-grave-bone-100 mb-2">
              Another Card
            </h3>
            <p className="text-grave-mist-300">
              Cards are perfect for organizing information.
            </p>
          </Card>
        </div>
      </section>

      {/* Badge Component */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-grave-bone-100 mb-6">Badge</h2>
        <Card>
          <div className="flex flex-wrap gap-4">
            <Badge variant="info">Info</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="success">Success</Badge>
          </div>
        </Card>
      </section>
    </div>
  );
}
