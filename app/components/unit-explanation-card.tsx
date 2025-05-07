export function UnitExplanationCard() {
	return (
		<div className="bg-neutral-800 text-gray-200 p-4 rounded-lg shadow-lg">
			<h3 className="text-lg font-semibold mb-2">Unit Explanation</h3>
			<p>In this scene:</p>
			<ul className="list-disc list-inside">
				<li>1 unit = 0.64285714 meters</li>
				<li>Character height: 2.8 units = 1.8 meters</li>
			</ul>
		</div>
	);
}
