import { useQuery } from '@apollo/client/react';
import type { DutyAttendanceSheetQuery } from 'meteor/idreesia-common/types/client-operations';

import { DUTY_ATTENDANCE_CARDS, DUTY_ATTENDANCE_SHEET } from '../gql';

export type SheetRow = NonNullable<
  NonNullable<DutyAttendanceSheetQuery['dutyAttendanceSheet']>[number]
> & { _id: string; karkunId: string };

export interface SheetParams {
  selectedMonth?: string;
  dutyId?: string;
  locationId?: string;
  shiftId?: string;
}

// The person shown on one printed card.
export interface CardKarkun {
  karkunId: string;
  name: string;
  bloodGroup?: string | null;
  imageData?: string | null;
  dutyName: string;
  shiftNames: string;
  percentage: number;
  barcodeId: string;
}

export const SHEET_PARAM_NAMES = ['selectedMonth', 'dutyId', 'locationId', 'shiftId'];

// Loads the attendance sheet rows for the print pages' query params.
export const useSheetRows = (params: SheetParams) => {
  const { data, loading, error } = useQuery(DUTY_ATTENDANCE_SHEET, {
    variables: {
      month: params.selectedMonth ?? '',
      dutyId: params.dutyId ?? '',
      locationId: params.locationId || undefined,
      shiftId: params.shiftId || undefined,
    },
    skip: !params.selectedMonth || !params.dutyId,
  });

  const rows = (data?.dutyAttendanceSheet ?? []).filter(
    (row): row is SheetRow => row?._id != null && row.karkunId != null
  );
  return { rows, loading, error };
};

// Loads the printed cards (one per karkun, totals computed on the server).
export const useCardKarkuns = (params: SheetParams & { karkunIds?: string }) => {
  const karkunIds = (params.karkunIds ?? '').split(',').filter(Boolean);
  const { data, loading } = useQuery(DUTY_ATTENDANCE_CARDS, {
    variables: {
      month: params.selectedMonth ?? '',
      dutyId: params.dutyId ?? '',
      locationId: params.locationId || undefined,
      shiftId: params.shiftId || undefined,
      karkunIds,
    },
    skip: !params.selectedMonth || !params.dutyId || karkunIds.length === 0,
  });

  const karkuns = (data?.dutyAttendanceCards ?? []).flatMap(card => {
    if (!card?.karkunId) return [];
    const sharedData = card.karkun?.sharedData;
    const cardKarkun: CardKarkun = {
      karkunId: card.karkunId,
      name: sharedData?.name ?? card.name ?? '',
      bloodGroup: sharedData?.bloodGroup,
      imageData: sharedData?.image?.data,
      dutyName: card.duty?.name ?? '',
      shiftNames: (card.shiftNames ?? []).filter(Boolean).join(', '),
      percentage: card.percentage ?? 0,
      barcodeId: card.barcodeId ?? '',
    };
    return [cardKarkun];
  });
  return { karkuns, loading };
};
