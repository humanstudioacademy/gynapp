import { Search, X } from 'lucide-react-native';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { Chip } from '@/components/ui/Chip';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { useEquipment, useMuscleGroups } from '@/features/catalog/hooks';
import { useTheme } from '@/theme/ThemeProvider';

export type Scope = 'all' | 'favorites' | 'mine';

type Props = {
  search: string;
  onSearchChange: (value: string) => void;
  scope: Scope;
  onScopeChange: (value: Scope) => void;
  muscleGroupId: string | null;
  onMuscleGroupChange: (value: string | null) => void;
  equipmentId: string | null;
  onEquipmentChange: (value: string | null) => void;
  /** O seletor de exercícios não precisa da aba "Meus". */
  showScope?: boolean;
};

export function CatalogFilters({
  search,
  onSearchChange,
  scope,
  onScopeChange,
  muscleGroupId,
  onMuscleGroupChange,
  equipmentId,
  onEquipmentChange,
  showScope = true,
}: Props) {
  const { colors } = useTheme();
  const muscleGroups = useMuscleGroups();
  const equipment = useEquipment();

  return (
    <View className="gap-3">
      <View className="mx-4 h-12 flex-row items-center gap-2 rounded-md border border-neutral-200 bg-white px-3 dark:border-neutral-800 dark:bg-neutral-900">
        <Search size={18} color={colors.textSecondary} />
        <TextInput
          value={search}
          onChangeText={onSearchChange}
          placeholder="Buscar exercício"
          placeholderTextColor={colors.textSecondary}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          accessibilityLabel="Buscar exercício"
          className="h-12 flex-1 text-base text-neutral-900 dark:text-neutral-50"
        />
        {search.length > 0 ? (
          <Pressable
            onPress={() => onSearchChange('')}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Limpar busca"
          >
            <X size={18} color={colors.textSecondary} />
          </Pressable>
        ) : null}
      </View>

      {showScope ? (
        <View className="mx-4">
          <SegmentedControl
            label="Filtrar por origem"
            value={scope}
            onChange={onScopeChange}
            options={[
              { value: 'all', label: 'Todos' },
              { value: 'favorites', label: 'Favoritos' },
              { value: 'mine', label: 'Meus' },
            ]}
          />
        </View>
      ) : null}

      <FilterRow label="Grupo muscular">
        <Chip label="Todos" selected={muscleGroupId === null} onPress={() => onMuscleGroupChange(null)} />
        {(muscleGroups.data ?? []).map((group) => (
          <Chip
            key={group.id}
            label={group.name_pt}
            tint={group.color_hex}
            selected={muscleGroupId === group.id}
            onPress={() => onMuscleGroupChange(muscleGroupId === group.id ? null : group.id)}
          />
        ))}
      </FilterRow>

      <FilterRow label="Equipamento">
        <Chip label="Todos" selected={equipmentId === null} onPress={() => onEquipmentChange(null)} />
        {(equipment.data ?? []).map((item) => (
          <Chip
            key={item.id}
            label={item.name_pt}
            selected={equipmentId === item.id}
            onPress={() => onEquipmentChange(equipmentId === item.id ? null : item.id)}
          />
        ))}
      </FilterRow>
    </View>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View className="gap-1.5">
      <Text className="mx-4 text-[11px] font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
        {label}
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        accessibilityLabel={label}
      >
        {children}
      </ScrollView>
    </View>
  );
}
