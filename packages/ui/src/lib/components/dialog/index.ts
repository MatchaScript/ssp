import Root from './dialog.svelte';
import Trigger from './dialog-trigger.svelte';
import Content from './dialog-content.svelte';
import Close from './dialog-close.svelte';
import Heading from './dialog-heading.svelte';
import Header from './dialog-header.svelte';
import Body from './dialog-body.svelte';
import Footer from './dialog-footer.svelte';
import Hero from './dialog-hero.svelte';

export {
	Root,
	Trigger,
	Content,
	Close,
	Heading,
	Header,
	Body,
	Footer,
	Hero,
	//
	Root as Dialog,
	Trigger as DialogTrigger,
	Content as DialogContent,
	Close as DialogClose,
	Heading as DialogHeading,
	Header as DialogHeader,
	Body as DialogBody,
	Footer as DialogFooter,
	Hero as DialogHero
};

export type {
	DialogRootProps as RootProps,
	DialogTriggerProps as TriggerProps,
	DialogContentProps as ContentProps,
	DialogCloseProps as CloseProps,
	DialogHeadingProps as HeadingProps,
	DialogHeaderProps as HeaderProps,
	DialogBodyProps as BodyProps,
	DialogFooterProps as FooterProps,
	DialogHeroProps as HeroProps,
	DialogSize as Size
} from './types.js';
