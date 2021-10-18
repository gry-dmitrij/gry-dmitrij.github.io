const yearsCategory = document.getElementById('years-category');
const yearsValue = document.getElementById('years-value');

if (yearsCategory && yearsValue) {
	yearsCategory.textContent = 'Возраст:';
	yearsValue.textContent = `${getAge('06.02.1986')}`;
}

function getAge(dateString)
{
	const today = new Date();
	const birthDate = new Date(dateString);
	let age = today.getFullYear() - birthDate.getFullYear();
	const m = today.getMonth() - birthDate.getMonth();
	if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate()))
	{
		age--;
	}
	return age;
}
