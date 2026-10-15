import React from 'react';
import {S} from '../lib/schedule';
import {Scene} from './Scene';
import {S1S2Map} from './S1S2Map';
import {S3Settings} from './S3Settings';
import {S4Bonnet} from './S4Bonnet';
import {S5Search} from './S5Search';
import {S6Plate} from './S6Plate';
import {S7Picker} from './S7Picker';
import {S8Outro} from './S8Outro';

// S1 + S2 share one continuous camera; drift is off (S2 must hold dead still in the silence).
export const SCENES_EXTRA: React.ReactNode = (
	<>
		<Scene name="S1+S2 Map dive / Dropout A" from={S.s1.start} to={S.s2.end} drift={false}>
			<S1S2Map />
		</Scene>
		<Scene name="S3 Slam / Settings / ad-lib 1" from={S.s3.start} to={S.s3.end}>
			<S3Settings />
		</Scene>
		<Scene name="S4 Crew / bonnet / peg" from={S.s4.start} to={S.s4.end}>
			<S4Bonnet />
		</Scene>
		<Scene name="S5 Manak → Nipsey / ad-lib 2" from={S.s5.start} to={S.s5.end}>
			<S5Search />
		</Scene>
		{/* the plate flies in over the end of S5 and lands on L7; S6 stays under the picker sheet */}
		<Scene name="S6 Number plate" from={S.s6.start} to={S.s6.end} padIn={12} padOut={40}>
			<S6Plate />
		</Scene>
		<Scene name="S7 Colour picker / white flood" from={S.s7.start} to={S.s7.end} drift={false}>
			<S7Picker />
		</Scene>
		<Scene name="S8 Pin / pull back / end card" from={S.s8.start} to={S.s8.end}>
			<S8Outro />
		</Scene>
	</>
);
