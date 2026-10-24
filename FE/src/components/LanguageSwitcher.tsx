import { Dropdown } from "antd";
import { DownOutlined } from "@ant-design/icons";
import useLanguageStore, { Language } from "../stores/languageStore.ts";

const languages: { code: Language; label: string; flag: string }[] = [
    { code: "en", label: "English", flag: "🇬🇧" },
    { code: "vn", label: "Tiếng Việt", flag: "🇻🇳" },
];

interface LanguageSwitcherProps {
    className?: string;
    showLabel?: boolean;
}

export default function LanguageSwitcher({ className = "", showLabel = false }: LanguageSwitcherProps) {
    const { currentLanguage, setLanguage } = useLanguageStore();

    const current = languages.find((l) => l.code === currentLanguage);

    return (
        <Dropdown
            menu={{
                selectedKeys: [currentLanguage],
                items: languages.map((l) => ({ key: l.code, label: `${l.flag} ${l.label}` })),
                onClick: ({ key }) => setLanguage(key as Language),
            }}
            trigger={["click"]}
            placement="bottomRight"
        >
            <button
                type="button"
                className={`flex items-center gap-2 p-2 hover:bg-yellow-50 dark:hover:bg-gray-800 rounded-xl transition-colors text-gray-700 dark:text-gray-200 ${className}`}
            >
                <span className="text-base leading-none">{current?.flag}</span>
                {showLabel && (
                    <span className="text-xs font-semibold uppercase tracking-wider">{currentLanguage}</span>
                )}
                <DownOutlined className="text-[10px] opacity-70" />
            </button>
        </Dropdown>
    );
}
