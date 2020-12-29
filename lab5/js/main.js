/**
* Решение задачи линейного программирования
* Табличный Симпликс метот
* 
* Made by Tod
* http://tj-s.ru/tod/
*/

$(document).ready(function(){
	// Задаем глобальную переменную
	max_x = 2;
	// Счтаем максимальное количество Иксов
	$('#ogranichenie_block .ogranichenie').each(function(){
		var input_num = $(this).find('input').length -1;
		if (input_num>max_x)
			max_x = input_num;
	})
	// Показываем ограничения 
	//(сделано для плавного появления новых ограничений)
	$('.ogranichenie').show();
	
})
	// Показываем или скрываем пример
	$('#info a.example').live('click', function(){
		if ($('#info .left').is(':hidden')){
			$(this).text('Скрыть пример ▲');
			$('#info .left').slideDown(200);
		}else{
			$('#info .left').slideUp(200);
			$(this).text('Показать пример ▼');
		}
		return false;
	})
	// Добавляем Х
	$('a.add_x').live('click', function(){
		// Ограничили количество Иксов до 7, иначе они не помещаются в строчку и смотрятся некрасиво
		if ($(this).parents('.virazhenie').find('input').length < 7){ // Ограничение можно снять или изменить
			if ($(this).parents('.uravnenie').length){
				var count_x = $(this).parents('.virazhenie').find('input').length +1;
				if (count_x > max_x)
					max_x = count_x;
			}else{
				var count_x = $(this).parents('.virazhenie').find('input').length;
				if (count_x > max_x)
					max_x = count_x;		
				
			}
			$('.virazhenie').children('.left_side').append('+<input type="text" value ="0" />X'+count_x);
		}
		return false;
	})
	
	// Добавляем ограничение
	$('.ogranichenie_add a').live('click', function(){
		var html_inputs = '<input type="text" value ="0" />X1';
		for (var q = 2; q<=max_x;q++)
			html_inputs += '+<input type="text" value ="0" />X'+q;
		var html_code = '<div class="ogranichenie virazhenie"><span class="left_side">'+html_inputs+'</span><span class="right_side"><a href="#" class="add_x">+</a><select><option value="1">≤</option><option value="-1">≥</option></select><input type="text" value ="0" /></span></div>';		
		$('#ogranichenie_block').append(html_code);
		$('#ogranichenie_block .ogranichenie:hidden').slideDown(200);
		
		return false;
	})	
	// Начмнаем считать
	$('.submit a').live('click', function(){
	$('#result').html(' '); // Очищаем поле результатов
		var matrix = new Array();
	//	var count_ogr = $('#ogranichenie_block .ogranichenie').length;
		matrix = new Array();
		var i = 0;
	/*################## ШАГ 0 ##################*/	
	// Перебираем все ограничения
		$('#ogranichenie_block .ogranichenie').each(function(){
			matrix[i] = new Array();
			for (var j = 0; j < max_x + 1; j++) {
				if ($(this).find('input').eq(j).length && $(this).find('input').eq(j).val() ){
					var inp_val = $(this).find('input').eq(j).val() * $(this).find('select').val();
				}else{
					var inp_val = 0;
				}
				matrix[i][j] = inp_val; // Матрица исходных значений
			}
			i++;
		})
	// Массив индексов по горизонтале
		horisont_x = new Array();
		for (i=0; i< max_x + 1; i++){
			horisont_x[i] = i;
		}
	// Массив индексов по вертикале
		vertical_x = new Array();
		for (i=0; i< $('#ogranichenie_block .ogranichenie').length; i++){
			vertical_x[i] = i + max_x;
		}		
	// Матрица свободных членов	
		var free = new Array();
		for (var k=0; k < matrix.length; k++){
			free[k] = matrix[k][max_x];
		}
		free[matrix.length] = 0;

	// Последняя строка сама функция
		Fun = new Array();
		for (var j = 0; j < matrix[0].length; j++) {
			if ($('.uravnenie .left_side').find('input').eq(j).length){
				var inp_val = $('.uravnenie .left_side').find('input').eq(j).val() * $('.uravnenie select').val();
			}else{
				var inp_val = 0;
			}
			Fun[j] = inp_val; // Матрица исходных значений
		}
	// Добавим ее в основную матрицу
		matrix.push(Fun); 
	
	// Есть ли  отрицательные элементы в матрице свободных членов ?
	if (minelm(free) < 0){ 
		iteration = 0; // счетчик итераций, для защиты от зависаний
		step1(); // Переходим к шагу 1
	}
	// Есть ли  отрицательные элементы в коэфициентах функции (последняя строчка) ?
	if (minelm(matrix[matrix.length-1], false, true) < 0){
		iteration = 0; // счетчик итераций, для защиты от зависаний
		step2(); // Переходим к шагу 2
	}	
	print_table(matrix); // Отображаем итоговую таблицу
	results(); // Отображаем результаты в понятном виде
	
/*################## ШАГ1 ##################*/
function step1(){
		iteration++;
		// находим ведущую строку
		var min_k_num = minelm(free, true, true);
		
		// находим ведущий столбец		
		var min_k1 = minelm(free)
		if (minelm(matrix[min_k_num]) < 0){
			var min_k1_num = minelm(matrix[min_k_num], true, true);
		}else{
			alert('Условия задачи несовместны и решений у нее нет');
			return false;
		}
		// Печатаем таблицу и выделяем на ней ведущие строку и столбец
		print_table(matrix, min_k_num, min_k1_num); 
		// Обновляем индексы элементов по горизонтале и вертикале
		tmp = horisont_x[min_k1_num];
		horisont_x[min_k1_num] = vertical_x[min_k_num];
		vertical_x[min_k_num] = tmp;
		

	// Замена	
		update_matrix(min_k_num, min_k1_num);
	// матрица свободных членов
		for (var k=0; k < matrix.length; k++){
			free[k] = matrix[k][max_x];
		}
		

		if (minelm(free, false, true) < 0 && iteration < 10) // нужно ли еще разок пройти второй шаг ?
		if (confirm("продолжаем Шаг 1_"+iteration+" ?")) // Да здравсвует рекурсия, но спросим (чтобы комп не завис)
			step1();
	
}


/*################## ШАГ2 ##################*/	
function step2(){
		iteration++;
		// находим ведущий столбец
		var min_col_num = minelm(matrix[matrix.length-1], true, true);
		
		// находим ведущую строку
		var cols_count = matrix[0].length -1;
		var min_row_num = 999;
		// эмпирический коэфициент, тк мы не знаем, положително ли нулевое отношение
		var min_row = 9999; 
		var tmp = 0;
		for (i = 0; i< matrix.length-1; i++){
			tmp = free[i]/matrix[i][min_col_num];
			if (tmp < min_row && tmp>=0){
				min_row_num = i;
				min_row = tmp;
			}
		}
		
		min_k1_num = min_col_num;
		min_k_num = min_row_num;
		// Печатаем таблицу и выделяем на ней ведущие строку и столбец
		print_table(matrix, min_k_num, min_k1_num);
		// Обновляем индексы элементов по горизонтале и вертикале
		tmp = horisont_x[min_k1_num];
		horisont_x[min_k1_num] = vertical_x[min_k_num];
		vertical_x[min_k_num] = tmp;
		// Если мы не нашли ведущую строку (999 - это наш эмпирический коэфициент)
		if (min_row_num == 999){
			alert('функция в области допустимых решений задачи не ограничена');
			return false;
		}

	// Замена	
		update_matrix(min_k_num, min_k1_num);
	// матрица свободных членов
		for (var k=0; k < matrix.length; k++){
			free[k] = matrix[k][max_x];
		}
		
	// нужно ли еще разок пройти второй шаг ?	
		if (minelm(matrix[matrix.length-1], false, true) < 0 && iteration < 10) 
	// Да здравсвует рекурсия, но спросим, чтобы комп не завис		
		if (confirm("продолжаем Шаг 2_"+iteration+" ?")) 
			step2();

}
// Функция замены (обновления матрицы)
function update_matrix(min_k_num, min_k1_num){

		var matrix1 = new Array();
	
		for (i = 0; i< matrix.length; i++){
			matrix1[i] = new Array()
			for (j = 0; j< matrix[0].length; j++){
				if (i == min_k_num && j ==min_k1_num){
					matrix1[i][j] = 1/matrix[i][j];
				}else{
					if (i == min_k_num){
						matrix1[i][j] = matrix[i][j] * 1/matrix[min_k_num][min_k1_num];
					}else{
						if (j == min_k1_num){
							matrix1[i][j] = -matrix[i][j] * 1/matrix[min_k_num][min_k1_num];
						}else{
							matrix1[i][j] = matrix[i][j] - matrix[i][min_k1_num]*matrix[min_k_num][j]/matrix[min_k_num][min_k1_num];
						}
					}
			
				}
				matrix1[i][j] = Math.round(matrix1[i][j]*1000)/1000;
			}
		}
		matrix = matrix1;

	return false;

}


	// Выводим результаты в понятном виде
	function results(){
		var nulls = '';
		// Иксы, равные нулю
		for (i = 0; i< horisont_x.length-1;i++){
			if (horisont_x[i]<max_x)
				nulls +=('X'+(horisont_x[i]+1)+'=');
		}
		nulls +='0 <br /><br />';
		var vars ='';
		// Иксы, отличные от нуля
		for (i = 0; i< vertical_x.length;i++){
			if (vertical_x[i]<max_x)
				vars += 'X'+(vertical_x[i]+1)+'='+matrix[i][max_x]+'<br />';
		}
		var main_result = '';
		// Минимум(максимум) функции
		if ($('.uravnenie select').val() > 0)
			main_result = 'min F ='+matrix[matrix.length-1][max_x]*(-1);
		else
			main_result = 'max F ='+matrix[matrix.length-1][max_x];
			
		$('#result').append(nulls+vars+'<br />'+main_result);
	}
	return false;
})
	
	
	// Вывод таблицы.
	function print_table(arr, row, col){
		var max_i = arr.length;
		var max_j = arr[0].length;
		var html_table = '';
		var html_head = '<th></th>';
		// заголовки
		for (var j = 0; j < max_j-1; j++) {
			html_head +='<th>X'+(horisont_x[j]+1)+'</th>'
		}	
		html_head +='<th>Своб.члены</th>'
		html_head ='<thead><tr>'+html_head+'</tr></thead>';
		// Элементы
		for (var i = 0; i < max_i; i++) {
			html_table +='<tr>';
			if (!(i == max_i-1)){
				html_table +='<th>X'+(vertical_x[i]+1)+'</th>';
			}else{
				html_table +='<th>F</th>';
			}
			
			for (var j = 0; j < max_j; j++) {
				html_table +='<td>'+arr[i][j]+'</td>'
			}
			html_table +='</tr>';
		}
	
		$('#result').append('<table>'+html_head+html_table+'</table>');
		// Выделяем колонку, если указана
		if (col !== undefined)
			$('table:last tr').each(function(){
				$(this).children('td').eq(col).addClass('selected');
			})
		// Выделяем строку, если указана
		if (row !== undefined)
			$('table:last tr').eq(row+1).addClass('selected');
	}
// Поиск минимального элемента
function minelm(v, dispnum, not_last){ 
    var m= v[0];
	var num= 0;
	var len=0;
	// если not_last, то последний элемент не учитываем в массиве
	if (not_last){
		len = v.length-2;
	}else{
		len = v.length-1;
	}
    for (var i=1; i <= len; i++){ 
		if (v[i] < m ){
			m= v[i];
			num = i
		}
    }
	// Выводим номер минимального
	if (dispnum){
		return num
	}else{ // или значение
		return m
	}
}



// Made by Tod
// http://tj-s.ru/tod/