(function($){
	// View: AJAX Image Uploader
	ImagesUpload	= Backbone.View.extend({

		initialize	: function(options){
			//_.bindAll( this , 'onFileUploaded', 'onFileAdded' , 'onFilesBeforeSend' , 'onUploadComplete');
			_.bindAll(this, 'onFileUploaded', 'onFileAdded', 'onFilesBeforeSend', 'onUploadComplete', 'onUploadErrorResponse');
			this.options 	= options;
			this.uploaderID	= (this.options.uploaderID) ? this.options.uploaderID : 'et_uploader';

			this.config	= {
				runtimes			: 'gears,html5,flash,silverlight,browserplus,html4',
				multiple_queues		: true,
				multipart			: true,
				urlstream_upload	: true,
				multi_selection		: false,
				upload_later		: false,
				container			: this.uploaderID + '_container',
				browse_button		: this.uploaderID + '_browse_button',
				thumbnail			: this.uploaderID + '_thumbnail',
				thumbsize			: 'thumbnail',
				file_data_name		: this.uploaderID,
				max_file_size 		: '5mb',
				//chunk_size 			: '1mb',
				// this filters is an array so if we declare it when init Uploader View, this filters will be replaced instead of extend
				filters				: [
					{ title : 'Image Files', extensions : 'jpg,jpeg,gif,png,ico' }
				],
				multipart_params	: {
					fileID		: this.uploaderID
				},
				init : {
		            Error: function(up, err) {
	               	//alert(args.message);
		            }
		        }

			};
			if(typeof this.options.filters !='undefined'){
                jQuery.extend(true, this.options.filters, this.config.filters);
            }
			jQuery.extend( true, this.config, fe_globals.plupload_config, this.options );

			this.controller	= new plupload.Uploader( this.config );
			this.controller.init();
            this.controller.bind('FileUploaded', this.onFileUploaded);
            this.controller.bind('FilesAdded', this.onFileAdded);
            this.controller.bind('BeforeUpload', this.onFilesBeforeSend);
            this.bind('UploadSuccessfully', this.onUploadComplete);
            this.bind('UploadErrorResponse', this.onUploadErrorResponse);
            if (typeof this.controller.settings.onProgress === 'function') {
                this.controller.bind('UploadProgress', this.controller.settings.onProgress);
            }

            this.controller.bind('Error', this.errorLog);

            if (typeof this.controller.settings.cbRemoved === 'function') {
                this.controller.bind('FilesRemoved', this.controller.settings.cbRemoved);
            }

		},
		errorLog: function(up , err) {
            //console.log(b);
            var o = this;
        	var message, details = "";
            message = '<strong>' + err.message + '</strong>';

            switch (err.code) {
                case plupload.FILE_EXTENSION_ERROR:
                    details = fe_globals.plupload_config.msg.FILE_EXTENSION_ERROR.replace("%s",o.settings.filters.mime_types[0].extensions);
                    break;

                case plupload.FILE_SIZE_ERROR:
                    details = fe_globals.plupload_config.msg.FILE_SIZE_ERROR.replace( "%s", o.settings.max_file_size );
                    break;

                case plupload.FILE_DUPLICATE_ERROR:
                    details = fe_globals.plupload_config.msg.FILE_DUPLICATE_ERROR;
                    break;

                case self.FILE_COUNT_ERROR:
                    details = fe_globals.plupload_config.msg.FILE_COUNT_ERROR;
                    break;

                case plupload.IMAGE_FORMAT_ERROR :
                   details = fe_globals.plupload_config.msg.IMAGE_FORMAT_ERROR;
                    break;

                case plupload.IMAGE_MEMORY_ERROR :
                    details = fe_globals.plupload_config.msg.IMAGE_MEMORY_ERROR;
                    break;


                case plupload.HTTP_ERROR:
                    details = fe_globals.plupload_config.msg.HTTP_ERROR;
                    break;
            }
            alert(details);
        },

		onFileAdded	: function(up, files){
			if( typeof this.controller.settings.cbAdded === 'function' ){
				this.controller.settings.cbAdded(up,files);
			}
			if(!this.controller.settings.upload_later){
				up.refresh();
				up.start();
				//console.log('start');
			}
		},

		onFileUploaded	: function(up, file, res){
			res	= $.parseJSON(res.response);
			if( typeof this.controller.settings.cbUploaded === 'function' ){
				this.controller.settings.cbUploaded(up,file,res);
			}
			if (res.success){
				this.updateThumbnail(res.data);
				this.trigger('UploadSuccessfully', res);
			}
		},

		updateThumbnail	: function(res){
			var that		= this,
				$thumb_div	= this.$('#' + this.controller.settings['thumbnail']),
				$existing_imgs, thumbsize;

			if ($thumb_div.length>0){

				$existing_imgs	= $thumb_div.find('img'),
				thumbsize	= this.controller.settings['thumbsize'];

				if ($existing_imgs.length > 0){
					$existing_imgs.fadeOut(100, function(){
						$existing_imgs.remove();
						if( _.isArray(res[thumbsize]) ){
							that.insertThumb( res[thumbsize][0], $thumb_div );
						}
					});
				}
				else if( _.isArray(res[thumbsize]) ){
					this.insertThumb( res[thumbsize][0], $thumb_div );
				}
			}
		},

		insertThumb	: function(src,target){
			jQuery('<img>').attr({
					'id'	: this.uploaderID + '_thumb',
					'class' : 'avatar',
					'src'	: src
				})
				// .hide()
				.appendTo(target)
				.fadeIn(300);
		},

		updateConfig	: function(options){
			if ('updateThumbnail' in options && 'data' in options ){
				this.updateThumbnail(options.data);
			}
			$.extend( true, this.controller.settings, options );
			this.controller.refresh();
		},

		onFilesBeforeSend : function(){
			if('beforeSend' in this.options && typeof this.options.beforeSend === 'function'){
				this.options.beforeSend(this.$el);
			}
		},
		onUploadComplete : function(res){
			if('success' in this.options && typeof this.options.success === 'function'){
				this.options.success(res);
			}
		},
		onUploadErrorResponse:function(res){
            if ('errorResponsed' in this.options && typeof this.options.errorResponsed === 'function') {
                this.options.errorResponsed(res);
            }
            else{
                if(res.hasOwnProperty('msg')){
                    alert(res.msg);
                }
            }
        },

	});

})(jQuery);