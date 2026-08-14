import { Image } from 'expo-image';
import { Text, View } from 'react-native';

type Size = 'xs' | 'sm' | 'md' | 'lg';

const sizePx: Record<Size, number> = { xs: 28, sm: 40, md: 56, lg: 96 };
const textClass: Record<Size, string> = {
  xs: 'text-[11px]',
  sm: 'text-sm',
  md: 'text-lg',
  lg: 'text-3xl',
};

type Props = {
  uri?: string | null;
  name?: string | null;
  size?: Size;
};

/** Iniciais a partir do nome: "Leonardo Scapinello" -> "LS". */
function initials(name?: string | null): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
  return (first + last).toUpperCase() || '?';
}

export function Avatar({ uri, name, size = 'md' }: Props) {
  const px = sizePx[size];
  const label = name ? `Foto de ${name}` : 'Foto de perfil';

  if (uri) {
    return (
      <Image
        source={uri}
        style={{ width: px, height: px, borderRadius: px / 2 }}
        contentFit="cover"
        transition={150}
        accessibilityLabel={label}
      />
    );
  }

  return (
    <View
      style={{ width: px, height: px, borderRadius: px / 2 }}
      accessibilityLabel={label}
      className="items-center justify-center bg-neutral-200 dark:bg-neutral-800"
    >
      <Text className={`font-semibold text-neutral-600 dark:text-neutral-300 ${textClass[size]}`}>
        {initials(name)}
      </Text>
    </View>
  );
}
