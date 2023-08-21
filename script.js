

const canvas = $("#canvas");
const defaultFieldWidthInput = $("#field-width");
const removeContainer = $("#remove-container"); // Select the remove container
let draggedField = null;
let selectedField = null;

function setCanvasSize() {
    const newWidth = Number($("#paper_width").val());
    const newHeight = Number($("#paper_height").val());

    $('#canvas').css("width", newWidth + "in");
    $('#canvas').css("height", newHeight + "in");
}


function setEditValues(){

    let template_data= {};

   $("#paper_width").val(template_data?.paper_width);
   $("#paper_height").val(template_data?.paper_height);

    let data = [

        {
            "name": "Field 1",
            "x_axis": "1.90625",
            "y_axis": "200",
            "width": "290",
            "alignment": "center",
            "letter_spacing": "2",
            "fontSize": "14"
        }
    ];

    let fields= '';

    $.each(data,function(index,value){

        let name = value?.name;
        let x_axis = value?.x_axis;
        let y_axis = value?.y_axis;
        let width = value?.width;
        let fontSize = value?.fontSize;
        let letter_spacing = value?.letter_spacing ?? 0;
        let alignment = value?.alignment;
        fields  += createField(name,x_axis,y_axis,width,fontSize,letter_spacing,alignment);
        
    })

    canvas.append(fields);

    $('.field_width').trigger('keyup');
    setCanvasSize();

}


$(document).ready(function() {

    // setEditValues();
    setCanvasSize();
});

    $(".draggable_field").on("dragstart", function(event) {

        event.originalEvent.dataTransfer.setData("text/plain", $(this).text());
        draggedField = $(this);
    });

    canvas.on("dragover", function(event) {
        event.preventDefault();
    });

    canvas.on("drop", function(event) {
        event.preventDefault();

        if (draggedField) {
            const field_name = $(draggedField).text().trim();
            const offsetX = event.originalEvent.clientX - canvas.offset().left - draggedField.width() / 2;
            const offsetY = event.originalEvent.clientY - canvas.offset().top - draggedField.height() / 2;

            let default_width           = defaultFieldWidthInput.val();
            let default_font_size       = $('#default_font_size').val();
            let default_letter_spacing  = $('#default_letter_spacing').val();

            const droppedField = createField(field_name, offsetX, offsetY,default_width,default_font_size,default_letter_spacing);
            canvas.append(droppedField);

            draggedField = null;
        }
    });

    canvas.on("mousedown", ".draggable_field", function(event) {
        if (!$(event.target).closest(".attributes-container").length) {
            selectedField = $(this);
            selectedField.addClass("selected");
            selectedField.css("cursor", "grabbing");
        }
    });


    canvas.on("mousemove", function(event) {
        if (selectedField) {

            const canvasRect = canvas[0].getBoundingClientRect();
            const offsetX = event.clientX - canvasRect.left - selectedField.width() / 2;
            const offsetY = event.clientY - canvasRect.top - selectedField.height() / 2;
            
            // Check if selectedField is over a div with class "parent"
            const parentDiv = $("#remove-container")[0];
            const parentRect = parentDiv.getBoundingClientRect();
            
            const parentOffsetX = parentRect.left - canvasRect.left;
            const parentOffsetY = parentRect.top - canvasRect.top;
            
            const isOverParent = (
                offsetX >= parentOffsetX &&
                offsetX <= parentOffsetX + parentRect.width &&
                offsetY >= parentOffsetY &&
                offsetY <= parentOffsetY + parentRect.height
            );
            
            selectedField.css("left", offsetX + "px");
            selectedField.css("top", offsetY + "px");

            if (isOverParent) {
                removeContainer.addClass("dragover");
            }else{
                removeContainer.removeClass("dragover");
            }
        }
    });

    $(document).on("mouseup", function() {
        if (selectedField) {
            selectedField.removeClass("selected");
            selectedField.css("cursor", "grab");
            selectedField = null;
    
            const removeContainerRect = removeContainer[0].getBoundingClientRect();
    
            canvas.find(".draggable_field").each(function() {
                const field = $(this);
                const position = field.css("position");

                    const fieldRect = field[0].getBoundingClientRect();

                    const isTouchingRemoveContainer = (
                        fieldRect.left <= removeContainerRect.right &&
                        fieldRect.right >= removeContainerRect.left &&
                        fieldRect.top <= removeContainerRect.bottom &&
                        fieldRect.bottom >= removeContainerRect.top
                    );

                    if (isTouchingRemoveContainer) {
                        field.remove();
                        removeContainer.removeClass("dragover");

                    }
                
            });
        }
    });

    function createField(text, left, top,width,font_size,default_letter_spacing,alignment='left') {

   

        let letter_spacing =  default_letter_spacing;

        if(Number(default_letter_spacing) == 0){
            letter_spacing = "normal";
        }else{
            letter_spacing = letter_spacing+"px";
        }


        let draggable_field =`
            <div class="draggable_field" data-field-name="${text}" style="position: absolute;left:${left}px ;top:${top}px ;width:${width}px" ondblclick="showAttributeContainer(this)">
                <div>
                    <label style="margin-bottom : 0px !important;font-size:${font_size}px;letter-spacing:${letter_spacing};text-align:${alignment}" class="form-label field_name" >${text}</label>
                </div>
            
                <div class="attributes-container">

                    <div class="row">
                        <div class="col-sm-6">
                            <label class="form-label">Field Width (PX)</label>
                        </div>

                        <div class="col-sm-6">
                        <input type="number" class="field_width form-control" onkeyup="setFieldAttributes(this)" onchange="setFieldAttributes(this)" value="${width}">

                        </div>
                    </div>


                    <div class="row">
                        <div class="col-sm-6">
                            <label class="form-label">Alignment</label>
                        </div>

                        <div class="col-sm-6">
                            <select class="field_alignment form-control"  onchange="setFieldAttributes(this)">
                                <option value="left">Left</option>
                                <option value="center">Center</option>
                                <option value="right">Right</option>
                            </select>

                        </div>
                    </div>

                    <div class="row">
                        <div class="col-sm-6">
                            <label class="form-label">Font Size (PX)</label>
                        </div>

                        <div class="col-sm-6">
                            <input type="number" class="field_font_size form-control" onkeyup="setFieldAttributes(this)" onchange="setFieldAttributes(this)" value="${font_size}">
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-sm-6">
                            <label class="form-label">Letter Spacing</label>
                        </div>

                        <div class="col-sm-6">
                            <input type="number" class="field_letter_spacing form-control" onkeyup="setFieldAttributes(this)" onchange="setFieldAttributes(this)" value="${default_letter_spacing}">
                        </div>
                    </div>
                
                   
                    
                </div>
            
            </div>
        `;

        return draggable_field;
    }


function showAttributeContainer(e){
    let field = $(e).closest('.draggable_field');
    field.find('.attributes-container').toggleClass("show");
}





function setFieldAttributes(e){

    const closest_div = $(e).closest(".draggable_field");
    let label= closest_div.find('.field_name');

    const newWidth       = closest_div.find('.field_width').val();
    let align_value      = closest_div.find('.field_alignment').val();
    let font_size        = closest_div.find('.field_font_size').val();
    let letter_spacing   = closest_div.find('.field_letter_spacing').val();


    let has_letter_spacing = Number(letter_spacing) > 0;
    if(has_letter_spacing){
        letter_spacing = letter_spacing+"px";
    }else{
        letter_spacing = "normal";

    }

    if (!isNaN(newWidth)) {
        closest_div.css("width", newWidth + "px");
    }
  
    label.css("font-size", font_size+'px');
    label.css("text-align", align_value);
    label.css("letter-spacing", letter_spacing);
    if(has_letter_spacing){
        label.css("font-family", "Courier New, monospace" );
    }else{
        label.css("font-family", "Arial, sans-serif" );
    }
}



function createInput(type, className, defaultValue = "") {
    const input = $("<input>");
    input.attr("type", type);
    input.addClass(className);
    input.val(defaultValue);
    return input;
}

function removeAllFields(){

    let confirmed= confirm("Are You Sure Want To Remove All Fields");

    if(confirmed){
        $("#canvas").find(".draggable_field").fadeOut("slow", function() {
            $(this).remove();
        });
    }
}



$("#submit-button").on("click", function() {
    const fieldElements = $('#canvas').find(".draggable_field");
    const data = [];
    $.each(fieldElements , function(index,value){

        field = $(value);
        data.push({
            name        : field.data('fieldName'),
            x_axis      : field.css("left"),
            y_axis      : field.css("top"),
            width       : field.find(".field_width").val() + "px",
            alignment   : field.find(".field_alignment").val(),
            fontSize    : field.find(".field_font_size").val() + "px"
        });
    })

   let template={
        paper_height : $('#paper_height').val(),
        paper_width  : $('#paper_width').val(),
        fields       : data
    }


    console.log(template);
   
});
