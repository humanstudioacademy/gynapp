import { Image } from 'expo-image';
import {
  Circle,
  Cog,
  Disc,
  Dumbbell,
  GitMerge,
  Grip,
  Minus,
  MoreHorizontal,
  Rows3,
  User,
  type LucideIcon,
} from 'lucide-react-native';
import { View } from 'react-native';

import { supabase } from '@/lib/supabase/client';

/** Ícone por slug de equipamento — o `icon` do seed segue os nomes do lucide. */
const EQUIPMENT_ICON: Record<string, LucideIcon> = {
  barbell: Dumbbell,
  dumbbell: Dumbbell,
  machine: Cog,
  cable: GitMerge,
  bodyweight: User,
  kettlebell: Circle,
  band: Minus,
  smith: Rows3,
  plate: Disc,
  bench: Rows3,
  pullup_bar: Grip,
  other: MoreHorizontal,
};

type Props = {
  thumbnailPath?: string | null;
  muscleColor?: string;
  equipmentSlug?: string | null;
  /** Para leitores de tela: "Peito, Barra". */
  label?: string;
  size?: number;
};

/**
 * A v1 lança sem GIF de execução (decisão D3). Sem mídia, mostramos um bloco na
 * cor do grupo muscular com o ícone do equipamento — a lista fica colorida e
 * legível em vez de parecer quebrada. Quando `thumbnail_path` for preenchido,
 * o componente passa a usar a imagem sem nenhuma mudança de código.
 */
export function ExerciseThumb({
  thumbnailPath,
  muscleColor,
  equipmentSlug,
  label,
  size = 48,
}: Props) {
  const color = muscleColor ?? '';

  if (thumbnailPath) {
    const url = supabase.storage.from('exercise-media').getPublicUrl(thumbnailPath).data.publicUrl;
    return (
      <Image
        source={url}
        style={{ width: size, height: size, borderRadius: 8 }}
        contentFit="cover"
        transition={150}
        accessibilityLabel={label}
      />
    );
  }

  const Icon = EQUIPMENT_ICON[equipmentSlug ?? 'other'] ?? MoreHorizontal;

  return (
    <View
      style={{
        width: size,
        height: size,
        // Alpha 0x22 sobre a cor do grupo: contraste suficiente nos dois temas.
        backgroundColor: color ? `${color}22` : undefined,
      }}
      accessibilityLabel={label}
      className="items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800"
    >
      <Icon size={size * 0.45} color={color || undefined} strokeWidth={1.8} />
    </View>
  );
}
