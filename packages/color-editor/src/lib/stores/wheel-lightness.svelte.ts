let current = $state(70);

export const wheelLightnessStore = {
	get value() {
		return current;
	},
	set value(v: number) {
		current = v;
	}
};
