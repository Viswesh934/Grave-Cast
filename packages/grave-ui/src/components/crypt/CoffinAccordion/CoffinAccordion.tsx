/**
 * CoffinAccordion - Expandable sections with coffin theme
 * @module components/crypt/CoffinAccordion
 */

import { createContext, useContext, useState, useRef, useEffect, type ReactNode } from 'react';
import { Card } from '../../primitives/Card';
import { Button } from '../../primitives/Button';
import { Coffin } from '../../../assets/svg/base/Coffin';
import { useAnimationState } from '../../../hooks/useAnimationState';
import { animations } from '../../../tokens';

/**
 * Accordion item identifier type
 */
type AccordionValue = string;

/**
 * Accordion context for managing state
 */
interface AccordionContextValue {
  openItems: Set<AccordionValue>;
  toggle: (value: AccordionValue) => void;
  collapsible: boolean;
  multiple: boolean;
}

const AccordionContext = createContext<AccordionContextValue | null>(null);

/**
 * Hook to access accordion context
 */
const useAccordion = () => {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error('Accordion components must be used within CoffinAccordion');
  }
  return context;
};

/**
 * CoffinAccordion root props
 */
export interface CoffinAccordionProps {
  /** Child accordion items */
  children: ReactNode;
  /** Type of accordion behavior */
  type?: 'single' | 'multiple';
  /** Whether items can be collapsed after opening */
  collapsible?: boolean;
  /** Default open item value(s) */
  defaultValue?: AccordionValue | AccordionValue[];
  /** Controlled open value(s) */
  value?: AccordionValue | AccordionValue[];
  /** Callback when value changes */
  onValueChange?: (value: AccordionValue | AccordionValue[]) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * CoffinAccordion - A compound accordion component with coffin theme.
 * 
 * Demonstrates advanced patterns:
 * - Compound component architecture (Item, Trigger, Content sub-components)
 * - Context-based state sharing
 * - Controlled/uncontrolled modes
 * - Render prop flexibility
 * 
 * Composes Card, Button primitives with Coffin SVG and animation tokens.
 * 
 * @example Basic single-select accordion
 * ```tsx
 * <CoffinAccordion type="single" collapsible>
 *   <CoffinAccordion.Item value="item-1">
 *     <CoffinAccordion.Trigger>First Secret</CoffinAccordion.Trigger>
 *     <CoffinAccordion.Content>Hidden content...</CoffinAccordion.Content>
 *   </CoffinAccordion.Item>
 *   <CoffinAccordion.Item value="item-2">
 *     <CoffinAccordion.Trigger>Second Secret</CoffinAccordion.Trigger>
 *     <CoffinAccordion.Content>More secrets...</CoffinAccordion.Content>
 *   </CoffinAccordion.Item>
 * </CoffinAccordion>
 * ```
 * 
 * @example Multiple items with custom trigger
 * ```tsx
 * <CoffinAccordion type="multiple" defaultValue={['faq-1']}>
 *   <CoffinAccordion.Item value="faq-1">
 *     <CoffinAccordion.Trigger>
 *       {({ isOpen }) => (
 *         <span className={isOpen ? 'text-red-500' : ''}>
 *           What lies within?
 *         </span>
 *       )}
 *     </CoffinAccordion.Trigger>
 *     <CoffinAccordion.Content>Ancient knowledge</CoffinAccordion.Content>
 *   </CoffinAccordion.Item>
 * </CoffinAccordion>
 * ```
 * 
 * @example Controlled mode
 * ```tsx
 * const [value, setValue] = useState<string>('item-1');
 * 
 * <CoffinAccordion 
 *   type="single"
 *   value={value}
 *   onValueChange={setValue}
 * >
 *   <CoffinAccordion.Item value="item-1">...</CoffinAccordion.Item>
 * </CoffinAccordion>
 * ```
 */
export const CoffinAccordion = ({
  children,
  type = 'single',
  collapsible = false,
  defaultValue,
  value: controlledValue,
  onValueChange,
  className = '',
}: CoffinAccordionProps) => {
  // Determine if controlled
  const isControlled = controlledValue !== undefined;

  // Initialize open items
  const getInitialOpenItems = (): Set<AccordionValue> => {
    if (controlledValue !== undefined) {
      return new Set(Array.isArray(controlledValue) ? controlledValue : [controlledValue]);
    }
    if (defaultValue !== undefined) {
      return new Set(Array.isArray(defaultValue) ? defaultValue : [defaultValue]);
    }
    return new Set();
  };

  const [internalOpenItems, setInternalOpenItems] = useState(getInitialOpenItems);

  // Sync controlled value
  useEffect(() => {
    if (isControlled && controlledValue !== undefined) {
      setInternalOpenItems(new Set(Array.isArray(controlledValue) ? controlledValue : [controlledValue]));
    }
  }, [controlledValue, isControlled]);

  const openItems = isControlled ? new Set(Array.isArray(controlledValue) ? controlledValue : [controlledValue || '']) : internalOpenItems;

  const toggle = (value: AccordionValue) => {
    const newOpenItems = new Set(openItems);
    
    if (newOpenItems.has(value)) {
      if (collapsible || type === 'multiple') {
        newOpenItems.delete(value);
      }
    } else {
      if (type === 'single') {
        newOpenItems.clear();
      }
      newOpenItems.add(value);
    }

    if (!isControlled) {
      setInternalOpenItems(newOpenItems);
    }

    if (onValueChange) {
      const newValue = type === 'single' 
        ? (newOpenItems.size > 0 ? Array.from(newOpenItems)[0] : '')
        : Array.from(newOpenItems);
      onValueChange(newValue);
    }
  };

  return (
    <AccordionContext.Provider value={{ openItems, toggle, collapsible, multiple: type === 'multiple' }}>
      <div className={`grave-coffin-accordion ${className}`} role="region">
        {children}
      </div>
    </AccordionContext.Provider>
  );
};

/**
 * CoffinAccordion.Item props
 */
export interface AccordionItemProps {
  /** Unique value for this item */
  value: AccordionValue;
  /** Whether this item is disabled */
  disabled?: boolean;
  /** Child trigger and content */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * AccordionItem - Individual accordion section container
 */
const AccordionItem = ({
  value,
  disabled = false,
  children,
  className = '',
}: AccordionItemProps) => {
  const { openItems } = useAccordion();
  const isOpen = openItems.has(value);

  return (
    <Card
      variant={isOpen ? 'elevated' : 'flat'}
      className={`grave-coffin-accordion__item ${isOpen ? 'grave-coffin-accordion__item--open' : ''} ${className}`}
      data-state={isOpen ? 'open' : 'closed'}
      data-disabled={disabled || undefined}
    >
      {children}
    </Card>
  );
};

/**
 * Render prop function for custom triggers
 */
type TriggerRenderProp = (props: { isOpen: boolean; disabled?: boolean }) => ReactNode;

/**
 * CoffinAccordion.Trigger props
 */
export interface AccordionTriggerProps {
  /** Trigger content - can be ReactNode or render prop */
  children: ReactNode | TriggerRenderProp;
  /** Whether to show coffin icon */
  showIcon?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * AccordionTrigger - Clickable header to toggle item
 */
const AccordionTrigger = ({
  children,
  showIcon = true,
  className = '',
}: AccordionTriggerProps) => {
  const { toggle } = useAccordion();
  const itemElement = useRef<HTMLDivElement>(null);
  
  // Get item context from parent
  const item = itemElement.current?.closest('[data-state]') as HTMLElement | null;
  const value = item?.closest('.grave-coffin-accordion__item')?.querySelector('[data-value]')?.getAttribute('data-value') || '';
  const isOpen = item?.getAttribute('data-state') === 'open';
  const disabled = item?.getAttribute('data-disabled') === 'true';

  const { isAnimating, startAnimation } = useAnimationState();

  const handleClick = () => {
    if (disabled) return;
    startAnimation();
    toggle(value);
  };

  const content = typeof children === 'function' 
    ? (children as TriggerRenderProp)({ isOpen, disabled })
    : children;

  return (
    <div ref={itemElement} data-value={value}>
      <Button
        variant="ghost"
        onClick={handleClick}
        disabled={disabled}
        aria-expanded={isOpen}
        className={`grave-coffin-accordion__trigger ${isAnimating ? 'grave-coffin-accordion__trigger--animating' : ''} ${className}`}
      >
        {showIcon && (
          <Coffin 
            size={20} 
            className={`grave-coffin-accordion__icon ${isOpen ? 'grave-coffin-accordion__icon--open' : ''}`}
            color="currentColor"
          />
        )}
        <span className="grave-coffin-accordion__trigger-text">{content}</span>
      </Button>
    </div>
  );
};

/**
 * Render prop function for custom content
 */
type ContentRenderProp = (props: { isOpen: boolean }) => ReactNode;

/**
 * CoffinAccordion.Content props
 */
export interface AccordionContentProps {
  /** Content to show when expanded - can be ReactNode or render prop */
  children: ReactNode | ContentRenderProp;
  /** Additional CSS classes */
  className?: string;
}

/**
 * AccordionContent - Expandable content area
 */
const AccordionContent = ({
  children,
  className = '',
}: AccordionContentProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const item = contentRef.current?.closest('[data-state]') as HTMLElement | null;
  const isOpen = item?.getAttribute('data-state') === 'open';

  const [height, setHeight] = useState<number | 'auto'>(isOpen ? 'auto' : 0);

  // Parse duration from token (e.g., "300ms" -> 300)
  const animationDuration = parseInt(animations.durations.creep.replace('ms', ''), 10);

  useEffect(() => {
    if (!contentRef.current) return () => {};

    if (isOpen) {
      const contentHeight = contentRef.current.scrollHeight;
      setHeight(contentHeight);
      
      // Set to auto after animation completes for dynamic content
      const timer = setTimeout(() => {
        setHeight('auto');
      }, animationDuration);

      return () => clearTimeout(timer);
    } else {
      // First set to explicit height
      setHeight(contentRef.current.scrollHeight);
      // Then animate to 0
      requestAnimationFrame(() => {
        setHeight(0);
      });
      return () => {};
    }
  }, [isOpen, animationDuration]);

  const content = typeof children === 'function'
    ? (children as ContentRenderProp)({ isOpen })
    : children;

  return (
    <div
      ref={contentRef}
      className={`grave-coffin-accordion__content ${className}`}
      style={{
        height: height === 'auto' ? 'auto' : `${height}px`,
        overflow: 'hidden',
        transition: `height ${animations.durations.creep} ${animations.easing.easeInOut}`,
      }}
      role="region"
      aria-hidden={!isOpen}
    >
      <div className="grave-coffin-accordion__content-inner">
        {content}
      </div>
    </div>
  );
};

// Attach sub-components to main component
CoffinAccordion.Item = AccordionItem;
CoffinAccordion.Trigger = AccordionTrigger;
CoffinAccordion.Content = AccordionContent;
