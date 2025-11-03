import Image from 'next/image';
import Link from '@components/ui/link';
import cn from 'classnames';
import { siteSettings } from '@settings/site-settings';
import logo from "assets/images/logo-white.png";

const LogoWhite: React.FC<React.AnchorHTMLAttributes<{}>> = ({
    className,
    href = siteSettings.logo.href,
    ...props
}) => {
    return (
        <Link
            href={href}
            className={cn(
                'inline-block focus:outline-none max-w-44 w-full',
                className,
            )}
            {...props}
        >
            <Image
                src={'/assets/images/logo-white.png'}
                alt={"logo"}
                width={180}
                height={80}
                loading="eager"
            />
        </Link>
    );
};

export default LogoWhite;
